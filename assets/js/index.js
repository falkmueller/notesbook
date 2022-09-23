var router = require("./lib/router");
router.routes['/'] = require("./components/content-table.compnent");
router.routes['/add'] = require("./components/select-type.component");
router.routes['/add/directory'] = require("./components/add-directory.component");;
router.routes['/add/content'] = require("./components/add-content.component");
router.routes['/edit/content'] = require("./components/edit-content.component");
router.routes['/page'] = require("./components/page.component");

var app = require("./app");
app.types.push(require("./types/link.type"));
app.types.push(require("./types/text.type"));
app.run()