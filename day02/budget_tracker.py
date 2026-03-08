def get_positive_float(prompt):
    while True:
        val = input(prompt).strip()
        if val.lower() == 'done':
            return 'done'
        try:
            num = float(val)
            if num < 0:
                print("Error: Value cannot be negative. Please try again.")
                continue
            return num
        except ValueError:
            print("Error: Please enter a valid number or 'done'.")

def run_budget_tracker():
    while True:
        print("\n--- Budget Tracker (Type 'done' to exit) ---")
        
        budget = get_positive_float("Enter initial budget: ")
        if budget == 'done':
            break

        expenses = []
        aborted = False
        for i in range(1, 4):
            expense = get_positive_float(f"Enter expense {i}: ")
            if expense == 'done':
                aborted = True
                break
            expenses.append(expense)
        
        if aborted:
            break

        total_expenses = sum(expenses)
        remainder = budget - total_expenses

        print("-" * 30)
        if remainder < 0:
            debt = abs(remainder)
            print(f"Status   : You are in debt of {debt:,.2f} LKR")
        else:
            print(f"Remainder: {remainder:,.2f} LKR")
            if remainder < 500:
                print("Warning  : Low funds!")
        print("-" * 30)

if __name__ == "__main__":
    run_budget_tracker()
