import os
import subprocess


#sherlock is a project that allows you to get social media links that are associated with a username
# Getting links require you to install sherlock on your computer. After that, you must do pip install -r sherlock-requirements.txt
def get_links_from_username(username):
    sherlock_location = "~/Developer/sherlock/"
    destination = "{}/{}".format(os.getcwd(), username + "_sherlock.txt")

    p = subprocess.Popen(
        "cd {} && python3 sherlock {} -o {}".format(
            sherlock_location, username, destination
        ),
        shell=True,
    )
    p.wait()
    links = []

    with open("{}_sherlock.txt".format(username)) as f:

        for line in f:
            line = line.strip()
            links.append(line)
        f.close()
    links.pop()
    return links
