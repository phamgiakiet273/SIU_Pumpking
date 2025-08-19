from pathlib import Path
import sys

current_path = Path(__file__).resolve()
for parent in current_path.parents:
    if parent.name == "SIU_Pumpking":
        #print(f"Adding {parent} to sys.path")
        sys.path.append(str(parent))
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")

# add child path manually
current_path = Path(__file__).resolve()
for parent in current_path.parents:
    if parent.name == "SIU_Pumpking":
        base_path = parent
        new_path = base_path / "engine"
        sys.path.append(str(new_path))  # Add /engine path
        #print(f"Added {new_path} to sys.path")
        break
else:
    raise RuntimeError("Could not find 'SIU_Pumpking' in the path hierarchy.")
