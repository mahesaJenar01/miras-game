import os

def print_directory_structure(startpath, indent=0):
    """
    Print the structure of directory startpath with indentation.
    """
    # Print the root directory name
    print('|' + '-' * indent + os.path.basename(os.path.abspath(startpath)))
    
    # List all files and directories in startpath
    for item in sorted(os.listdir(startpath)):
        path = os.path.join(startpath, item)
        
        # Skip hidden files/folders (those starting with .)
        if os.path.basename(path).startswith('.'):
            continue
            
        if os.path.isdir(path):
            # If item is a directory, recursively print its content
            print_directory_structure(path, indent + 4)
        else:
            # If item is a file, print its name with indentation
            print('|' + '-' * (indent + 4) + item)

if __name__ == "__main__":
    # Get the current working directory
    current_directory = os.getcwd()
    print(f"Directory structure for: {current_directory}")
    print_directory_structure(current_directory)