import subprocess
import sys, os

def run_automation(test_case_id):
    documents_dir = os.path.join(os.path.expanduser('~'), 'Documents')
    command = f'cd {documents_dir}\\Test-Robot && robot -d output -i {test_case_id} testsuites'

    subprocess.run(['cmd', '/c', command])

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Error: Test case ID is required as a command-line argument.")
        sys.exit(1)
    
    test_case_id = sys.argv[1]
    
    run_automation(test_case_id)