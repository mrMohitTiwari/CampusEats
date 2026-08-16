# CampusEats

Course assignment repository for **HTTP by Hand & Project Setup**.

## Files
- `http-log.md` — five annotated curl request/response pairs (includes one 404)
- `network-analysis.md` — DevTools Network observations
- `brief.md` — one-page CampusEats system brief
- `docs/` — supporting notes/screenshots if needed

## How I captured HTTP logs
Used PowerShell with `curl.exe -i` against JSONPlaceholder API:
- `https://jsonplaceholder.typicode.com/posts/1`
- `https://jsonplaceholder.typicode.com/posts/2`
- `https://jsonplaceholder.typicode.com/users/1`
- `https://jsonplaceholder.typicode.com/comments?postId=1`
- `https://jsonplaceholder.typicode.com/posts/999999` (404)

## Repo setup
Initial structure created and committed incrementally to show work history.