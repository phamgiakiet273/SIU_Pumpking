# file: qwen3_model.py

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch


class QwenChatModel:
    def __init__(self, model_path="Qwen/Qwen3-1.7B"):
        self.model_path = model_path
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,  # torch_dtype=torch.float16,
            device_map="auto",
        )

    def build_input(self, prompt, enable_thinking=True):
        """Tạo input tensor từ prompt."""
        messages = [{"role": "user", "content": prompt}]
        input_text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
            enable_thinking=enable_thinking,
        )
        return self.tokenizer([input_text], return_tensors="pt").to(self.model.device)

    def generate_response(self, prompt, max_new_tokens=32768):
        """Sinh phản hồi từ model, tách Thinking và Final Response."""
        model_inputs = self.build_input(prompt)
        generated_ids = self.model.generate(
            **model_inputs, max_new_tokens=max_new_tokens
        )

        output_ids = generated_ids[0][len(model_inputs.input_ids[0]) :].tolist()

        # Tìm token kết thúc phần "Thinking"
        try:
            think_end_token_id = 151668
            index = len(output_ids) - output_ids[::-1].index(think_end_token_id)
        except ValueError:
            index = 0

        thinking = self.tokenizer.decode(
            output_ids[:index], skip_special_tokens=True
        ).strip()
        response = self.tokenizer.decode(
            output_ids[index:], skip_special_tokens=True
        ).strip()

        return thinking, response
