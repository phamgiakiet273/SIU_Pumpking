from pyannote.audio import Model
from pyannote.audio.pipelines import VoiceActivityDetection
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import torch
import kenlm
import subprocess
import pydub
import numpy as np
from pyctcdecode import Alphabet, BeamSearchDecoderCTC, LanguageModel
import os
import math
from pydub import AudioSegment
from collections import defaultdict, OrderedDict

HF_token = METACLIPV2Config().HUGGINGFACE_HUB_TOKEN


class SpeechToText:
    # load language decoder from "ngram_lm_path" (.bin file)
    def get_decoder_ngram_model(self, tokenizer, ngram_lm_path):
        vocab_dict = tokenizer.get_vocab()
        sort_vocab = sorted((value, key) for (key, value) in vocab_dict.items())
        vocab = [x[1] for x in sort_vocab][:-2]
        vocab_list = vocab
        vocab_list[tokenizer.pad_token_id] = ""
        vocab_list[tokenizer.unk_token_id] = ""
        vocab_list[tokenizer.word_delimiter_token_id] = " "
        alphabet = Alphabet.build_alphabet(
            vocab_list, ctc_token_idx=tokenizer.pad_token_id
        )
        lm_model = kenlm.Model(ngram_lm_path)
        decoder = BeamSearchDecoderCTC(alphabet, language_model=LanguageModel(lm_model))
        return decoder

    # read wav file and return frame_rate, vector
    def read(self, f, normalized=True):
        a = pydub.AudioSegment.from_mp3(f)
        y = np.array(a.get_array_of_samples())
        if a.channels == 2:
            y = y.reshape((-1, 2))
        if normalized:
            return a.frame_rate, np.float32(y) / 2**15
        else:
            return a.frame_rate, y

    # convert audio from audio path to vector (normalized)
    def audio_to_vector(self, audio_path):
        sr, x = self.read(audio_path)
        return x

    def __init__(self):
        self.device = "cuda"
        # load processor and model for speech to text
        self.processor = Wav2Vec2Processor.from_pretrained(
            "phamgiakiet273/wav2vec2-base-vi-vlsp530h",
            use_auth_token=HF_token,
        )
        self.model = Wav2Vec2ForCTC.from_pretrained(
            "phamgiakiet273/wav2vec2-base-vi-vlsp530h",
            use_auth_token=HF_token,
        ).to(self.device)

        # init language model decoder
        self.lm_file = "/workspace/ai_intern/kietpg/cache/vi_lm_4grams.bin"
        self.ngram_lm_model = self.get_decoder_ngram_model(
            self.processor.tokenizer, self.lm_file
        )

        # init audio model and pipeline for voice activity detection
        self.audio_model = Model.from_pretrained(
            "pyannote/segmentation",
            use_auth_token=HF_token,
        ).to(self.device)
        self.audio_pipeline = VoiceActivityDetection(
            segmentation=self.audio_model, device=torch.device(self.device)
        )
        HYPER_PARAMETERS = {
            # onset/offset activation thresholds
            "onset": 0.5,
            "offset": 0.5,
            # remove speech regions shorter than that many seconds.
            "min_duration_on": 0.5,
            # fill non-speech regions shorter than that many seconds.
            "min_duration_off": 0.0,
        }
        self.audio_pipeline.instantiate(HYPER_PARAMETERS)

    # return transcript from audio file with beam search decode
    # audio file must be .wav file and 16k sampling rate
    def speech_to_text(self, audio_path: str):
        audio_vector = self.audio_to_vector(audio_path)
        inputs = self.processor(
            audio_vector, sampling_rate=16_000, return_tensors="pt"
        ).to(self.device)
        with torch.no_grad():
            outputs = self.model(**inputs).logits
        transcription = self.ngram_lm_model.decode(
            outputs.cpu().detach().numpy()[0], beam_width=500
        )
        return transcription

    # return transcript from video file
    # the function will save splitted .wav files in wav_path
    # the return is a dict : { tuple(start,end) : transcript }
    def video_to_text(self, video_path: str, wav_path: str):
        video_name = os.path.basename(video_path)
        total_wav_path = wav_path + str(video_name).replace(".mp4", "") + ".wav"
        if not (os.path.exists(total_wav_path)):
            command = (
                "ffmpeg -y -i " + video_path + " -ac 1 -ar 16000 " + total_wav_path
            )
            subprocess.call(command, shell=True)
        video_speech_region = self.audio_pipeline(total_wav_path)
        video_audio = AudioSegment.from_wav(total_wav_path)
        video_transcript = {}
        for speech in video_speech_region.get_timeline().support():
            # active speech between speech.start and speech.end
            start = math.floor(speech.start)
            end = math.ceil(speech.end)
            print("speech start: ", start, " ---- ", "speech end: ", end)
            cur_audio = video_audio[start * 1000 : end * 1000 + 1]
            cur_audo_path = wav_path + "speech" + str(start) + "-" + str(end) + ".wav"
            cur_audio.export(cur_audo_path, format="wav")
            transcription = self.speech_to_text(cur_audo_path)
            video_transcript[str(str(start) + "_" + str(end))] = transcription
        # text = self.speech_to_text(wav_path)
        return OrderedDict(video_transcript)


# s2t = SpeechToText()
# print(type(s2t.video_to_text(video_path="/dataset/AIC2023/original_dataset/0/videos/Videos_L01/video/L01_V001.mp4", wav_path="/workspace/ai_intern/test/")))
# print(s2t.speech_to_text(audio_path="/workspace/ai_intern/speech5-12.wav"))
