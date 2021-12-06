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
        req.session.status = null;
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
        if(!(req.session.status == 'admin' || req.session.status == 'manager')) {
            if (req.session.potential_client == false) {
                console.log('potential_client?: ' + req.session.potential_client);
                req.session.status = null;
                if(req.query.service_of_interest != null) {
                    var msg = req.query.service_of_interest;
                }
                if (req.query.id != null) {
                    console.log(req.query.id);
                    database.query(`UPDATE potential_clients SET product = '${req.query.id}' WHERE first_name = '${req.session.user}'`, (err, res) => {
                        if (err) throw err;
                    });
                }
                if (req.session.user == null) {
                    req.session.status = null;  
                }
            }
            req.session.potential_client = true;
        }
        res.render('dashboard', { status: req.session.status == 'admin' || req.session.status == 'manager', page: req.session.page != 'dashboard', user: req.session.user, potential_client: req.session.potential_client, alert: msg});
    }
}


// Display Users
exports.view = (req, res) => {
    if (req.session.user != null) {
        if (!((req.session.status == 'admin') || (req.session.status == 'manager'))) {
            var url = '';
            if (req.session.user != null) {
                url = 'dashboard';
            } else {
                url = 'login'
            }
            const error = encodeURIComponent("You don't have permissions to access this route!");
            res.redirect(`${url}?error=` + error);
        } else if (req.session.status == 'admin') {
            database.query('SELECT * FROM potential_clients;', (err, results) => {
                if (err) throw err;
                users = [];
                if (results.length != 0) {
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].manager != null) {
                            database.query(`SELECT first_name FROM managers WHERE first_name = '${results[i].manager}'`, (error, result) => {
                                if (error) throw error;
                                results[i].manager = result[0].first_name;
                            });
                        }
                        var object = results[i];
                        users.push(object['first_name']);
                    }
                }
                req.session.page = 'home';
                // var removed_user = req.query.removed;
                // results.sort((a,b) => (a.first_name > b.first_name) ? 1 : ((b.first_name > a.first_name) ? -1 : 0));
                database.query(`SELECT * FROM customers`, (err, answer) => {
                    if (err) throw err;
                    res.render('home', {answer, results, page: req.session.page == 'home', status: req.session.status == 'admin', user: req.session.user});
                });
            });
        } else {
            let manager;
            database.query(`SELECT users.first_name FROM users WHERE id = ${req.session.user}`, (err, result) => {
                if (err) throw err;
                manager = result[0].first_name;
                let manager_name = manager;
                database.query(`SELECT id FROM managers WHERE first_name = '${manager}';`, (err, row) => {
                    if (err) throw err;
                    manager = row[0].id;

                    database.query(`SELECT 
                    potential_clients.id, potential_clients.first_name, potential_clients.last_name, potential_clients.email, potential_clients.phone, potential_clients.occupation, potential_clients.product, potential_clients.add_info, potential_clients.source_info, potential_clients.manager, potential_clients.interaction_level, potential_clients.comments, potential_clients.status FROM potential_clients
                    INNER JOIN managers ON potential_clients.manager = managers.first_name
                    WHERE managers.first_name = '${manager_name}';`, (err, results) => {
                        console.log(req.session.user);
                        if (err) throw err;
                        users = [];
                        console.log(results);
                        for (let i = 0; i < results.length; i++) {
                            // if (results[i].manager != null) {
                            //     database.query(`SELECT first_name FROM managers WHERE id = ${results[i].manager}`, (error, resulting) => {
                            //         if (error) throw error;
                            //         results[i].manager = resulting[0].first_name;
                            //         // console.log(resulting);
                            //     });   
                            // }
                            var object = results[i];
                            users.push(object['first_name']);
                        }
                        req.session.page = 'home';
                        // var removed_user = req.query.removed;
                        // results.sort((a,b) => (a.first_name > b.first_name) ? 1 : ((b.first_name > a.first_name) ? -1 : 0));
                        res.render('home', {results, page: req.session.page == 'home', status: req.session.status == 'manager', user: req.session.user});
                    });
                });
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
    database.query('SELECT * FROM potential_clients', (err, results) => {
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
        
        database.query('SELECT * FROM potential_clients WHERE last_name LIKE ? OR first_name LIKE ? OR interaction_level LIKE ?',
        ['%' + target + '%', '%' + target + '%', '%' + target + '%'], (err, results) => {
            res.render('home', { results, status: req.session.status, user: req.session.user, page: true });
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
    database.query('SELECT * FROM potential_clients ORDER BY first_name;', (err, results) => {
        if (err) throw err;
        users = [];
        for (var i = 0; i < results.length; i++) {
            var object = results[i];
            users.push(object['first_name']);
        }
        var removed_user = req.query.removed;
        req.session.page = 'sorted';
        // results.sort((a,b) => (a.first_name > b.first_name) ? 1 : ((b.first_name > a.first_name) ? -1 : 0));
        res.render('home', {results, removed_user, status: req.session.status, user: req.session.user, page: req.session.page == 'sorted'});
    });
}


exports.form = (req, res) => {
    var status = req.session.status;
    var user = req.session.user;
    console.log(status + ' ' + user);
    res.render('add_user', {status: status, user: user});
}

// Add User
exports.add_user = (req, res) => {
    var {first_name, last_name, email, phone, product, add_info, source_info, occupation, interaction_level, comments, status, manager} = req.body;
        // console.log(search);
        console.log('Here it is: ' + manager);
        if (manager == '') {
            manager = 'NULL';
            database.query(`INSERT INTO potential_clients SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', phone = '${phone}', product = '${product}', add_info = '${add_info}', source_info = '${source_info}', occupation = '${occupation}', interaction_level = '${interaction_level}', comments = '${comments}', status = '${status}', manager = ${manager}`,
            (err, results) => {
                if (err) throw err;
                else {
                    res.render('add_user', {alert: `${first_name} has been added successfully.`, status: req.session.status, user: req.session.user});
                }
            });
        } else {
            database.query(`INSERT INTO potential_clients SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', phone = '${phone}', product = '${product}', add_info = '${add_info}', source_info = '${source_info}', occupation = '${occupation}', interaction_level = '${interaction_level}', comments = '${comments}', status = '${status}', manager = '${manager}'`,
            (err, results) => {
                if (err) throw err;
                else {
                    res.render('add_user', {alert: `${first_name} has been added successfully.`, status: req.session.status, user: req.session.user});
                }
            });
        }
        
}


// Edit User
exports.edit_user = (req, res) => {
    database.query('SELECT * FROM potential_clients WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw err;
        else {
            const admin = (req.session.status == 'admin');
            console.log(admin);
            res.render('edit_user', {results, status: req.session.status, user: req.session.user, admin: admin});
        }
    });
}


// Update User
exports.update_user = (req, res) => {
    var {first_name, last_name, email, phone, comments, product, source_info, manager, status, occupation, add_info, interaction_level} = req.body;
    if (status == 'active') {
        if (manager == '') {
            manager = 'NULL';
            database.query(`INSERT INTO customers (first_name, last_name, email, phone, occupation, product, add_info, source_info) VALUES('${first_name}', '${last_name}', '${email}', '${phone}', '${occupation}', '${product}', '${add_info}', '${source_info}')`, (err, result) => {
                if (err) throw err;
                else {
                    database.query(`DELETE FROM potential_clients WHERE first_name = '${first_name}'`, (err, r) => {
                        if (err) throw err;
                        else {
                            res.redirect('/');
                        }
                    });
                    let name;
                    database.query(`SELECT id FROM customers WHERE first_name = '${first_name}'`, (err, ans) => {
                        name = ans[0].id;
                        let product_id;
                        database.query(`SELECT id FROM products WHERE name = '${product}'`, (err, ans) => {
                            product_id = ans[0].id;
                            var today = new Date();
                            database.query(`INSERT INTO orders (customer_id, product_id, date_ordered) VALUES(${name}, ${product_id}, '${today.getFullYear()}/${today.getMonth()}/${today.getDate()}')`, (err, asnw) => {
                                if (err) throw err;
                            });
                        });
                    });
                }
            });
        } else {
            database.query(`INSERT INTO customers (first_name, last_name, email, phone, occupation, product, add_info, source_info) VALUES('${first_name}', '${last_name}', '${email}', '${phone}', '${occupation}', '${product}', '${add_info}', '${source_info}')`, (err, result) => {
                if (err) throw err;
                else {
                    database.query(`DELETE FROM potential_clients WHERE first_name = '${first_name}'`, (err, r) => {
                        if (err) throw err;
                        else {
                            res.redirect('/');
                        }
                    });
                    let name;
                    database.query(`SELECT id FROM customers WHERE first_name = '${first_name}'`, (err, ans) => {
                        name = ans[0].id;
                        let product_id;
                        database.query(`SELECT id FROM products WHERE name = '${product}'`, (err, ans) => {
                            product_id = ans[0].id;
                            var today = new Date();
                            database.query(`INSERT INTO orders (customer_id, product_id, date_ordered) VALUES(${name}, ${product_id}, '${today.getFullYear()}/${today.getMonth()}/${today.getDate()}')`, (err, asnw) => {
                                if (err) throw err;
                            });
                        });
                    });
                }
            });
        }
        
    } else {
        if (manager == '') {
            manager = 'NULL';
            database.query(`UPDATE potential_clients SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', phone = '${phone}', product = '${product}', source_info = '${source_info}', manager = ${manager}, status = '${status}', occupation = '${occupation}', add_info = '${add_info}', interaction_level = '${interaction_level}', comments = '${comments}' WHERE id = ${req.params.id}`, (err, results) => {
                if (err) throw err;
                else {
                    database.query('SELECT * FROM potential_clients WHERE id = ?', [req.params.id], (err, results) => {
                        if (err) throw err;
                        else {
                            res.render('edit_user', {results, alert: `${first_name} has been updated.`, admin: req.session.status == 'admin', status: req.session.status, user: req.session.user});
                        }
                    });
                }
            });
        } else {
            database.query(`UPDATE potential_clients SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', phone = '${phone}', product = '${product}', source_info = '${source_info}', manager = '${manager}', status = '${status}', occupation = '${occupation}', add_info = '${add_info}', interaction_level = '${interaction_level}', comments = '${comments}' WHERE id = ${req.params.id}`, (err, results) => {
                if (err) throw err;
                else {
                    database.query('SELECT * FROM potential_clients WHERE id = ?', [req.params.id], (err, results) => {
                        if (err) throw err;
                        else {
                            res.render('edit_user', {results, alert: `${first_name} has been updated.`, admin: req.session.status == 'admin', status: req.session.status, user: req.session.user});
                        }
                    });
                }
            });
        }
        
    }
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
    database.query('DELETE FROM potential_clients WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw err;
        var removed_user = encodeURIComponent('User successfully removed.');
        res.redirect('/?removed=' + removed_user);
    });
}


// View User
exports.view_user = (req, res) => {
    database.query('SELECT * FROM potential_clients WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw err;
        else {
            req.session.page = 'view_user';
            // console.log(results);
            res.render('view_user', {results, status: req.session.status, user: req.session.user});
        }
    });
};


// Services
exports.services = (req, res) => {
    database.query('SELECT * FROM products', (err, results) => {
        if (err) throw err;
        else {
            if (req.method == "POST") {
                const {first_name, last_name, email, phone} = req.body;
                database.query(`INSERT INTO potential_clients (first_name, last_name, email, phone) VALUES ('${first_name}', '${last_name}', '${email}', '${phone}');`, (err, rows) => {
                    if (err) throw err;
                    req.session.user = first_name;
                    req.session.status = 'user';
                    req.session.potential_client = false;
                    var alert = 'Thank you for leaving creadentials! Our managers will contact you as soon as possible!'
                    res.render('services', {results, status: req.session.status, user: req.session.user, potential_client: req.session.potential_client, alert: alert});
                });
                
            } else {
                req.session.potential_client = false;
                res.render('services', {results, status: req.session.status, user: req.session.user, potential_client: req.session.potential_client});
            }
        }
    });
};


// Single service page
exports.service = (req, res) => {
    database.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
        res.render('service', { results: results, status: req.session.status, user: req.session.user });
    });
}

exports.orders = (req, res) => {
    database.query('SELECT * FROM orders', (err, results) => {
        console.log(results);
        res.render('orders', {results, status: req.session.status, user: req.session.user});
    });
}