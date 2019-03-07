const ghPages = require('gh-pages');

ghPages.publish('dist', function(err) {
    if (err) {
        console.error(err);
        return;
    }
    console.log('success');
    ghPages.clean();
});
