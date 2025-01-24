import json

# Load the users from the JSON file
def load_users(filename):
    with open(filename, "r") as file:
        return json.load(file)

# Calculate the match score between two users
def calculate_match_score(user1, user2):
    score = 0
    # Compare attributes
    if user1["gender"] == user2["gender"]:
        score += 1
    if user1["year"] == user2["year"]:
        score += 1
    if user1["minor"] == user2["minor"]:
        score += 2
    if user1["location"] == user2["location"]:
        score += 2
    # Check interests for overlap
    score += len(set(user1["interests"]) & set(user2["interests"]))
    return score

# Find the best match for a given user
def find_best_match(current_user, users):
    best_match = None
    best_score = -1
    for user in users:
        if user != current_user:  # Avoid matching with themselves
            score = calculate_match_score(current_user, user)
            if score > best_score:
                best_score = score
                best_match = user
    return best_match

def main():
    # Load users from the JSON file
    filename = "users.json"
    users = load_users(filename)

    # Select a user to find a match for
    current_user = users[0]  # Using first user in list
    best_match = find_best_match(current_user, users)

    # Print the results
    print(f"Best match for {current_user['name']} is {best_match['name']} with a score of {calculate_match_score(current_user, best_match)}!")

# Run the program
if __name__ == "__main__":
    main()
