// Bubble sort algorithm for sorting array of strings in alphabetical order
function bubbleSort(array) {
    var size = array.length;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            if (array[j] > array[j + 1]) {
                var tmp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = tmp;
            }
        }
    }
    return array;
};

// Recursive binary search algorithm
var recursiveFunction = function (arr, x, start, end) {
      
    // Base Condition
    if (start > end) {
        return false;
    }
  
    // Find the middle index
    var mid = Math.floor((start + end) / 2);
  
    // Compare mid with given key x
    if (arr[mid] === x) {
        return x;
    }
         
    // If element at mid is greater than x, search in the left half of mid
    if(arr[mid] > x) {
        return recursiveFunction(arr, x, start, mid - 1);
    }

    // If element at mid is smaller than x, search in the right half of mid
    else {
        return recursiveFunction(arr, x, mid + 1, end);
    }
}


exports.login = (req, res) => {
    if (req.method == 'GET') {
        const error = req.query.error
        req.session.user = null;
        res.render('login', { layout: 'login', alert: error });
    }
}

exports.dashboard = (req, res) => {
    if (req.method == 'POST') {
        const {email, password} = req.body;
        database.query(`SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`, 
        (err, results) => {
            if (results.length != 0) {
                req.session.status = results[0].status;
                req.session.user = results[0].id;
                req.session.page = 'dashboard';
                res.render('dashboard', { status: req.session.status == 'admin' || req.session.status == 'manager', page: req.session.page != 'dashboard', user: req.session.user});
            } else {
                const error = 'Credentials are wrong!';
                res.redirect('login?error=' + error);
            }
        });
    }
    if (req.method == 'GET') {
        if (req.session.user != null) {
            res.render('dashboard', { status: req.session.status == 'admin' || req.session.status == 'manager', page: req.session.page != 'dashboard', user: req.session.user, alert: req.query.error});
        } else {
            const error = encodeURIComponent('You are not logged in!');
            res.redirect('login?error=' + error);
        }
    }
}


// Display Users
exports.view = (req, res) => {
    if (req.session.user != null) {
        if (req.session.status != ('admin' || 'manager')) {
            console.log(req.session.status);
            var url = '';
            if (req.session.user != null) {
                url = 'dashboard';
            } else {
                url = 'login'
            }
            const error = encodeURIComponent("You don't have permissions to access this route!");
            res.redirect(`${url}?error=` + error);
        } else {
            database.query('SELECT * FROM users WHERE status = "active";', (err, results) => {
                if (err) throw err;
                users = [];
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    users.push(object['first_name']);
                }
                req.session.page = 'home';
                console.log(req.session.page);
                // var removed_user = req.query.removed;
                // results.sort((a,b) => (a.first_name > b.first_name) ? 1 : ((b.first_name > a.first_name) ? -1 : 0));
                res.render('home', {results, page: req.session.page == 'home', status: req.session.status == 'admin' || req.session.status == 'manager', user: req.session.user});
            });
        }
    } else {
        const error = encodeURIComponent('You are not logged in!');
        res.redirect('login?error=' + error);
    }
};


// Search User 
exports.search = (req, res) => {
        var target = req.body.search;
        database.query('SELECT * FROM users', (err, results) => {
            var users = [];
            var name = [];
            var surname = []
            for (var i = 0; i < results.length; i++) {
                name.push(results[i]['first_name']);
                surname.push(results[i]['last_name']);
            }

            name = bubbleSort(name);
            surname = bubbleSort(surname);

            users.push(name);
            users.push(surname);
            

            name = recursiveFunction(users[0], target, 0, users[0].length - 1);
            surname = recursiveFunction(users[1], target, 0, users[1].length - 1);
            if (name == false) name = surname;
            if (surname == false) surname = name;
            // console.log(name);
            // console.log(surname);
            
                database.query('SELECT * FROM users WHERE last_name LIKE ? OR first_name LIKE ?',
                ['%' + target + '%', '%' + target + '%'], (err, results) => {
                    res.render('home', { results });
                });

            // pool.getConnection((err, connection) => {
            //     connection.query('SELECT * FROM users WHERE last_name LIKE ? OR first_name LIKE ?',
            //     ['%' + name + '%', '%' + surname + '%'], (err, results) => {
            //         res.render('home', { results });
            //     });
            // })
            
        });
};


exports.sorted = (req, res) => {
        database.query('SELECT * FROM users WHERE status = "active" ORDER BY first_name;', (err, results) => {
            if (err) throw err;
            users = [];
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                users.push(object['first_name']);
            }
            var removed_user = req.query.removed;
            // results.sort((a,b) => (a.first_name > b.first_name) ? 1 : ((b.first_name > a.first_name) ? -1 : 0));
            res.render('home', {results, removed_user});
        });
}


exports.form = (req, res) => {
    res.render('home');
}

// Add User
exports.add_user = (req, res) => {
    const {first_name, last_name, email, phone, comments} = req.body;
        var search = req.body.search;
        // console.log(search);
        database.query('INSERT INTO users SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?',
        [first_name, last_name, email, phone, comments], (err, results) => {
            if (err) throw err;
            else {
                // console.log(results);
                res.render('add_user', { alert: `${first_name} has been added successfully.` });
            }
        });
}


// Edit User
exports.edit_user = (req, res) => {
        database.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
            if (err) throw err;
            else {
                // console.log(results);
                res.render('edit_user', {results});
            }
        });
}


// Update User
exports.update_user = (req, res) => {
    const {first_name, last_name, email, phone, comments} = req.body;
        database.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ? WHERE id = ?',
        [first_name, last_name, email, phone, comments, req.params.id], (err, results) => {
            if (err) throw err;
            else {
                    database.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
                        if (err) throw err;
                        else {
                            // console.log(results);
                            res.render('edit_user', {results, alert: `${first_name} has been updated.` });
                        }
                    });
            }
        });
}


// Delete User
exports.delete_user = (req, res) => {
    // pool.getConnection((err, connection) => {
    //     if(err) throw err;
    //     connection.query('DEvarE FROM users WHERE id = ?', [req.params.id], (err, results) => {
    //         if (err) throw err;
    //         else {
    //             console.log(results);
    //             res.redirect('/');
    //         }
    //     });
    // });

        if (err) throw err;
        database.query('UPDATE users SET status = ? WHERE id = ?', ['inactive', req.params.id], (err, results) => {
            connection.release();
            if (err) throw err;
            var removed_user = encodeURIComponent('User successfully removed.');
            res.redirect('/?removed=' + removed_user);
        });
}


// View User
exports.view_user = (req, res) => {
        database.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
            if (err) throw err;
            else {
                // console.log(results);
                res.render('view_user', {results});
            }
        });
};