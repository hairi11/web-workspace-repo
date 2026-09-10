\
# Web Workspace - WAR + npm Development

## Structure

```text
web-workspace/
├── pom.xml
├── common-js-web/
│   ├── pom.xml
│   ├── package.json
│   ├── src/
│   ├── test/
│   └── docs/
└── module-web/
    ├── pom.xml
    ├── user/
    │   ├── pom.xml
    │   └── src/
    │       ├── UserApi.js
    │       ├── UserService.js
    │       ├── UserFormAction.js
    │       ├── UserPage.js
    │       └── pages/
    │           ├── enquiry.html
    │           ├── create.html
    │           ├── update.html
    │           └── view.html
    ├── todos/
    │   ├── pom.xml
    │   └── src/
    │       ├── TodoApi.js
    │       ├── TodoService.js
    │       ├── TodoFormAction.js
    │       ├── TodoPage.js
    │       └── pages/
    │           ├── enquiry.html
    │           ├── create.html
    │           ├── update.html
    │           └── view.html
    └── webapp/
        ├── pom.xml
        ├── package.json
        ├── build.mjs
        ├── dev.mjs
        └── src/
```

`user` and `todos` are separate Maven modules.

`webapp` is the ONLY WAR, so runtime still has ONE context path:

```text
/module-web/
├── user/
└── todos/
```

---

# 1. Development using npm

Go to:

```bat
cd module-web\webapp
```

Install once:

```bat
npm install
```

Start development mode:

```bat
npm run dev
```

Open:

```text
http://localhost:3000/module-web/
http://localhost:3000/module-web/user/enquiry.html
http://localhost:3000/module-web/todos/enquiry.html
```

`npm run dev` provides:

- esbuild watch for User JavaScript
- esbuild watch for Todos JavaScript
- HTML/CSS source watching
- automatic rebuild
- automatic browser reload through BrowserSync

You edit source files directly in:

```text
module-web/user/src/
module-web/todos/src/
module-web/webapp/src/
```

Do NOT edit generated files under `webapp/dist`.

## Static npm serve without watch

```bat
npm run build
npm run serve
```

Then open:

```text
http://localhost:3000/module-web/
```

---

# 2. Build WAR using Maven

Requirements used by this workspace:

```text
JDK 17
Maven 3.5.4+
Node 24 LTS
npm 11+
```

Default Maven Node location:

```text
C:\Program Files\nodejs
```

If Node is elsewhere:

```bat
mvn clean package -Dnode.home="D:\Tools\nodejs"
```

From workspace root:

```bat
mvn clean package
```

Maven reactor:

```text
common-js-web
      ↓
module-web
      ├── user
      ├── todos
      └── webapp
             ↓
        module-web.war
```

WAR output:

```text
module-web\webapp\target\module-web.war
```

Deploy that ONE WAR to Tomcat:

```text
apache-tomcat\webapps\module-web.war
```

Then:

```text
http://localhost:8080/module-web/
http://localhost:8080/module-web/user/enquiry.html
http://localhost:8080/module-web/todos/enquiry.html
```

---

# REST API

User:

```text
GET  https://jsonplaceholder.typicode.com/users
GET  https://jsonplaceholder.typicode.com/users/{id}
POST https://jsonplaceholder.typicode.com/users
```

Todos:

```text
GET  https://jsonplaceholder.typicode.com/todos
GET  https://jsonplaceholder.typicode.com/todos/{id}
POST https://jsonplaceholder.typicode.com/todos
```

The example intentionally uses GET and POST only.

For the project convention:

- Create = POST
- Update = POST with `action: "update"`
- Delete = POST with `action: "delete"`

JSONPlaceholder is a fake REST API, so POST operations are not persisted.
