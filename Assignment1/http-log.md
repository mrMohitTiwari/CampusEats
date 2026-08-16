# HTTP Log

## Request 1 -get Post 1

### Request

```bash
curl.exe -i https://jsonplaceholder.typicode.com/posts/1
```

### Response

```text
HTTP/1.1 200 OK
Date: Sat, 15 Aug 2026 18:01:55 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 292
Connection: keep-alive
access-control-allow-credentials: true
Cache-Control: max-age=43200
etag: W/"124-yiKdLzqO5gfBrJFrcdJ8Yq0LGnU"
expires: -1
nel: {"report_to":"heroku-nel","response_headers":["Via"],"max_age":3600,"success_fraction":0.01,"failure_fraction":0.1}
pragma: no-cache
report-to: {"group":"heroku-nel","endpoints":[{"url":"https://nel.heroku.com/reports?s=vm67FVLNHsCgrFgubRa04ooDeMKdgwXS9H3i2IbjuoY%3D\u0026sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d\u0026ts=1785194657"}],"max_age":3600}
reporting-endpoints: heroku-nel="https://nel.heroku.com/reports?s=vm67FVLNHsCgrFgubRa04ooDeMKdgwXS9H3i2IbjuoY%3D&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&ts=1785194657"
Server: cloudflare
vary: Origin, Accept-Encoding
via: 2.0 heroku-router
x-content-type-options: nosniff
x-powered-by: Express
x-ratelimit-limit: 1000
x-ratelimit-remaining: 999
x-ratelimit-reset: 1785194663
Age: 26808
Accept-Ranges: bytes
cf-cache-status: HIT
CF-RAY: a2ba1b78ee9a37a5-BOM
alt-svc: h3=":443"; ma=86400

{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

**  Note :**`200 OK` means the server successfully returned the resource. `Content-Type: application/json` means the body is JSON.

---

## Request 2 -get Post 2

### Request

````bash
curl.exe -i https://jsonplaceholder.typicode.com/posts/2
  ```
  ### Response
  ``` text
  HTTP/1.1 200 OK
Date: Sat, 15 Aug 2026 18:05:58 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 278
Connection: keep-alive
access-control-allow-credentials: true
Cache-Control: max-age=43200
etag: W/"116-jnDuMpjju89+9j7e0BqkdFsVRjs"
expires: -1
nel: {"report_to":"heroku-nel","response_headers":["Via"],"max_age":3600,"success_fraction":0.01,"failure_fraction":0.1}
pragma: no-cache
report-to: {"group":"heroku-nel","endpoints":[{"url":"https://nel.heroku.com/reports?s=iXrXLjMshK%2BpdYafrnUJfREGdGA4ZlzQlCMxdLFlz8w%3D\u0026sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d\u0026ts=1786349193"}],"max_age":3600}
reporting-endpoints: heroku-nel="https://nel.heroku.com/reports?s=iXrXLjMshK%2BpdYafrnUJfREGdGA4ZlzQlCMxdLFlz8w%3D&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&ts=1786349193"
Server: cloudflare
vary: Origin, Accept-Encoding
via: 2.0 heroku-router
x-content-type-options: nosniff
x-powered-by: Express
x-ratelimit-limit: 1000
x-ratelimit-remaining: 999
x-ratelimit-reset: 1786349214
Age: 10783
Accept-Ranges: bytes
cf-cache-status: HIT
CF-RAY: a2ba21699fec3c0a-BOM
alt-svc: h3=":443"; ma=86400

{
"userId": 1,
"id": 2,
"title": "qui est esse",
"body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
}
````

**Note :** `200 OK` means success. `application/json` means JSON payload.

---

## Request 3 -get Post 3

### Request

```bash
curl.exe -i https://jsonplaceholder.typicode.com/users/1
```

### Response

```text
HTTP/1.1 200 OK
Date: Sat, 15 Aug 2026 18:12:57 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 509
Connection: keep-alive
access-control-allow-credentials: true
Cache-Control: max-age=43200
etag: W/"1fd-+2Y3G3w049iSZtw5t1mzSnunngE"
expires: -1
nel: {"report_to":"heroku-nel","response_headers":["Via"],"max_age":3600,"success_fraction":0.01,"failure_fraction":0.1}
pragma: no-cache
report-to: {"group":"heroku-nel","endpoints":[{"url":"https://nel.heroku.com/reports?s=GIwyebBgV7ZP9c3UF77flf3I4W3a8sXS5tSGoy7EShQ%3D\u0026sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d\u0026ts=1786526571"}],"max_age":3600}
reporting-endpoints: heroku-nel="https://nel.heroku.com/reports?s=GIwyebBgV7ZP9c3UF77flf3I4W3a8sXS5tSGoy7EShQ%3D&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&ts=1786526571"
Server: cloudflare
vary: Origin, Accept-Encoding
via: 2.0 heroku-router
x-content-type-options: nosniff
x-powered-by: Express
x-ratelimit-limit: 1000
x-ratelimit-remaining: 999
x-ratelimit-reset: 1786526575
Age: 1481
Accept-Ranges: bytes
cf-cache-status: HIT
CF-RAY: a2ba2ba0dc61ff68-BOM
alt-svc: h3=":443"; ma=86400

{
  "id": 1,
  "name": "Leanne Graham",
  "username": "Bret",
  "email": "Sincere@april.biz",
  "address": {
    "street": "Kulas Light",
    "suite": "Apt. 556",
    "city": "Gwenborough",
    "zipcode": "92998-3874",
    "geo": {
      "lat": "-37.3159",
      "lng": "81.1496"
    }
  },
  "phone": "1-770-736-8031 x56442",
  "website": "hildegard.org",
  "company": {
    "name": "Romaguera-Crona",
    "catchPhrase": "Multi-layered client-server neural-net",
    "bs": "harness real-time e-markets"
  }
}
```

** Note:** `200 OK` means the user exists and was returned. `application/json` identifies JSON format.
 
---

## Request 4 -get Post 4

### Request

```bash
curl.exe -i "https://jsonplaceholder.typicode.com/comments?postId=1"
```

##### Response

```text
HTTP/1.1 200 OK
Date: Sat, 15 Aug 2026 18:16:12 GMT
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive
access-control-allow-credentials: true
Cache-Control: max-age=43200
etag: W/"5e6-4bSPS5tq8F8ZDeFJULWh6upjp7U"
expires: -1
nel: {"report_to":"heroku-nel","response_headers":["Via"],"max_age":3600,"success_fraction":0.01,"failure_fraction":0.1}
pragma: no-cache
report-to: {"group":"heroku-nel","endpoints":[{"url":"https://nel.heroku.com/reports?s=73BybLGyGMJqZD%2F2hRIRiQCwFdXrxRwxdSJRoRzGWBI%3D\u0026sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d\u0026ts=1785195801"}],"max_age":3600}
reporting-endpoints: heroku-nel="https://nel.heroku.com/reports?s=73BybLGyGMJqZD%2F2hRIRiQCwFdXrxRwxdSJRoRzGWBI%3D&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&ts=1785195801"
Server: cloudflare
vary: Origin, Accept-Encoding
via: 2.0 heroku-router
x-content-type-options: nosniff
x-powered-by: Express
x-ratelimit-limit: 1000
x-ratelimit-remaining: 999
x-ratelimit-reset: 1785195803
Age: 2370
cf-cache-status: HIT
CF-RAY: a2ba3066acc2c795-BOM
alt-svc: h3=":443"; ma=86400

[
  {
    "postId": 1,
    "id": 1,
    "name": "id labore ex et quam laborum",
    "email": "Eliseo@gardner.biz",
    "body": "laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium"
  },
  {
    "postId": 1,
    "id": 2,
    "name": "quo vero reiciendis velit similique earum",
    "email": "Jayne_Kuhic@sydney.com",
    "body": "est natus enim nihil est dolore omnis voluptatem numquam\net omnis occaecati quod ullam at\nvoluptatem error expedita pariatur\nnihil sint nostrum voluptatem reiciendis et"
  },
  {
    "postId": 1,
    "id": 3,
    "name": "odio adipisci rerum aut animi",
    "email": "Nikita@garfield.biz",
    "body": "quia molestiae reprehenderit quasi aspernatur\naut expedita occaecati aliquam eveniet laudantium\nomnis quibusdam delectus saepe quia accusamus maiores nam est\ncum et ducimus et vero voluptates excepturi deleniti ratione"
  },
  {
    "postId": 1,
    "id": 4,
    "name": "alias odio sit",
    "email": "Lew@alysha.tv",
    "body": "non et atque\noccaecati deserunt quas accusantium unde odit nobis qui voluptatem\nquia voluptas consequuntur itaque dolor\net qui rerum deleniti ut occaecati"
  },
  {
    "postId": 1,
    "id": 5,
    "name": "vero eaque aliquid doloribus et culpa",
    "email": "Hayden@althea.biz",
    "body": "harum non quasi et ratione\ntempore iure ex voluptates in ratione\nharum architecto fugit inventore cupiditate\nvoluptates magni quo et"
  }
]
```

** Note:** `200 OK` means query request succeeded. `application/json` means JSON array/object response.

---

## Request 5 -get Post 5

### Request

```bash
curl.exe -i https://jsonplaceholder.typicode.com/posts/999999
```

### Response

```text
HTTP/1.1 404 Not Found
Date: Sat, 15 Aug 2026 18:17:59 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 2
Connection: keep-alive
access-control-allow-credentials: true
Cache-Control: max-age=43200
etag: W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"
expires: -1
nel: {"report_to":"heroku-nel","response_headers":["Via"],"max_age":3600,"success_fraction":0.01,"failure_fraction":0.1}
pragma: no-cache
report-to: {"group":"heroku-nel","endpoints":[{"url":"https://nel.heroku.com/reports?s=p7U3KSAl%2BsYlNCsuM1kWwjG%2FoTiWzCNXChvap8RujSY%3D\u0026sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d\u0026ts=1786801996"}],"max_age":3600}
reporting-endpoints: heroku-nel="https://nel.heroku.com/reports?s=p7U3KSAl%2BsYlNCsuM1kWwjG%2FoTiWzCNXChvap8RujSY%3D&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&ts=1786801996"
Server: cloudflare
vary: Origin, Accept-Encoding
via: 2.0 heroku-router
x-content-type-options: nosniff
x-powered-by: Express
x-ratelimit-limit: 1000
x-ratelimit-remaining: 999
x-ratelimit-reset: 1786802023
Age: 15882
cf-cache-status: HIT
CF-RAY: a2ba33009b815717-BOM
alt-svc: h3=":443"; ma=86400

{}
```

**Note:** `404 Not Found` means the requested resource does not exist. The response body is an empty JSON object `{}`.
