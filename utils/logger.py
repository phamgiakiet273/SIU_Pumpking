import logging
from pathlib import Path
from loguru import logger

from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    # Project root is detected by content (it holds configs/ and utils/)
    # rather than by folder name, so the tree can be checked out under any
    # directory name - e.g. SIU_Pumpking_local on a client machine.
    if (parent / "configs").is_dir() and (parent / "utils").is_dir():
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find the SIU_Pumpking project root (a parent directory containing configs/ and utils/).")

from configs.logger import LoggerConfig


def get_logger():
    """Return logger object."""
    return logger


def setup_logger(
    name: str = "app",
    logdir: Path | str = Path(LoggerConfig().LogDir),
    log_level: int = logging.INFO,
    backtrace: bool = LoggerConfig().BackTrace,
    serialize: bool = LoggerConfig().SerializeJSON,
    diagnose: bool = LoggerConfig().Diagnose,
):
    """Setup a logger with file and stream handlers.

    Args:
        name (str, optional): name of logger. Defaults to "app".

        logdir (Path | str, optional): folder where log files will
        be stored. Defaults to Path(LoggerConfig.LogDir).

        log_level (int, optional): log level. Defaults to logging.INFO.

        backtrace (bool, optional): enable backtrace. Defaults to LoggerConfig.BackTrace.

        serialize (bool, optional): enable serialize. Defaults to LoggerConfig.SerializeJSON.

        diagnose (bool, optional): enable diagnose. Defaults to LoggerConfig.Diagnose.

    Returns:
        logging.Logger: logger object
    """  # noqa: E501

    # Make log directory
    logdir = Path(logdir)
    logdir.mkdir(parents=True, exist_ok=True)
    path = logdir / name

    # Remove default std.err handler
    logger.remove(0)

    logger.add(
        sys.stdout,
        level=log_level,
        backtrace=backtrace,
        diagnose=diagnose,
        enqueue=True,
    )

    logger.add(
        path.with_suffix(".log"),
        level=log_level,
        rotation=int(LoggerConfig().MaxBytes),
        retention=int(LoggerConfig().MaxBackupCount),
        backtrace=backtrace,
        diagnose=diagnose,
        enqueue=True,
        serialize=serialize,  # Enable this to log in json format
    )

    return logger
