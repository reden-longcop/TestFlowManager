import subprocess
import sys

def run_automation(test_case_id):
    command = f'cd C:\\Users\\ITA-40138\\Documents\\robot-test-login && robot -d output -i {test_case_id} testsuites'

    subprocess.run(['cmd', '/c', command])

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Error: Test case ID is required as a command-line argument.")
        sys.exit(1)
    
    test_case_id = sys.argv[1]
    
    run_automation(test_case_id)