var router = require("./lib/router");
router.routes['/'] = require("./components/content-table.compnent");
router.routes['/add'] = require("./components/select-type.component");
router.routes['/directory/add'] = require("./components/directory/add-directory.component");
router.routes['/directory/edit'] = require("./components/directory/edit-directory.component");
router.routes['/content/add'] = require("./components/content/add-content.component");
router.routes['/content/edit'] = require("./components/content/edit-content.component");
router.routes['/page'] = require("./components/page.component");

var app = require("./app");
app.types.push(require("./types/link.type"));
app.types.push(require("./types/text.type"));
app.types.push(require("./types/file.type"));
app.run()