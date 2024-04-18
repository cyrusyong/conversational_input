import praw
import random
import math

reddit = praw.Reddit(
    client_id="yIEhEVxPlQZebcHUR3C5qw",
    client_secret="VCDs7AQRp5VstvpEuZSS_6abF-jTMg",
    user_agent="test script for privacy research",
)

def generate_user_data(username):
    user_object = {"posts": [], "comments": []}
    user = reddit.redditor(username)
    posts_by_subreddit = {}
    comments_by_subreddit = {}

    # Group posts by subreddit
    for post in user.submissions.new(limit=None):
        post_object = {
            "selftext": post.selftext,
            "subreddit": post.subreddit.display_name,
            "title": post.title,
            "url": post.url
        }
        if post.subreddit.display_name not in posts_by_subreddit:
            posts_by_subreddit[post.subreddit.display_name] = [post_object]
        else:
            posts_by_subreddit[post.subreddit.display_name].append(post_object)

    # Group comments by subreddit
    for comment in user.comments.new(limit=None):
        comment_object = {
            "body": comment.body,
            "url": comment.permalink
        }
        if comment.subreddit.display_name not in comments_by_subreddit:
            comments_by_subreddit[comment.subreddit.display_name] = [comment_object]
        else:
            comments_by_subreddit[comment.subreddit.display_name].append(comment_object)


    #Sample if Number of Posts in Subreddit Pass Threshold
    threshold = 30

    for subreddit, posts in posts_by_subreddit.items():
        if len(posts) > threshold:
            sampled_posts = random.sample(posts, threshold)
            user_object["posts"].extend(sampled_posts)
        else:
            user_object["posts"].extend(posts)

    for subreddit, comments in comments_by_subreddit.items():
        if len(comments) > threshold:
            sampled_comments = random.sample(comments, threshold)
            user_object["comments"].extend(sampled_comments)
        else:
            user_object["comments"].extend(comments)

    return user_object

# Example usage
# user_data = generate_user_data("username")
