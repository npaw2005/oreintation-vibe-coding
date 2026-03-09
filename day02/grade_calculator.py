def get_valid_mark(subject_name):
    while True:
        try:
            val = input(f"Enter marks for {subject_name}: ")
            if val.lower() == 'quit':
                return 'quit'
            
            mark = float(val)
            if 0 <= mark <= 100:
                return mark
            else:
                print("Error: Mark must be between 0 and 100.")
        except ValueError:
            print("Error: Please enter a valid number or 'quit'.")

def run_calculator():
    while True:
        name = input("Enter student name (or type 'quit' to exit): ")
        if name.lower() == 'quit':
            break

        marks = []
        aborted = False
        for i in range(1, 4):
            mark = get_valid_mark(f"Subject {i}")
            if mark == 'quit':
                aborted = True
                break
            marks.append(mark)
        
        if aborted:
            break

        average = sum(marks) / 3

        if average >= 75:
            grade = "A"
        elif average >= 60:
            grade = "B"
        elif average >= 40:
            grade = "C"
        else:
            grade = "Fail"

        # Output formatting exactly as requested
        print("------------------------------")
        print(f"Name : {name}")
        print(f"Average: {average:.1f}")
        print(f"Grade : {grade}")
        print("------------------------------")

if __name__ == "__main__":
    run_calculator()
