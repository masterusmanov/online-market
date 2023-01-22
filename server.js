import { write_file, read_file } from "./fs/fs_api.js";
import http from "http";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 1988;

let options = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }

http.createServer((req, res) => {
    if (req.method == "GET" ) {
        let Id = req.url.split("/")[2];
        if (req.url == "/markets") {
            let markets = read_file('markets.json');
            let branches = read_file("branches.json");
            let result = [];
            markets.find(market => {
                branches.find(branch => {
                    if (branch.marketId == market.marketId) {
                        result.push(branch)
                    }
                })
                market.branches = result
            })
            res.writeHead(200, options)
            res.end(JSON.stringify(markets))
        }

        if (req.url == "/branches") {
            let branches = read_file("branches.json");
            let products = read_file("products.json");
            let workers = read_file("workers.json");
            let result = []
            branches.find(branch => {
                products.find(product => {
                    if (product.branchId == branch.branchId) {
                        result.push(product);
                    }
                })
                branch.products = result
                result = [];
                workers.find(worker => {
                    if (worker.branchId == branch.branchId) {
                        result.push(worker);
                    }
                })
                branch.workers = result
            })
            res.writeHead(200, options);
            res.end(JSON.stringify(branches))
        }

        if (req.url == "/products") {
            let products = read_file("products.json");
            res.writeHead(200, options)
            res.end(JSON.stringify(products))
        }

        if (req.url == "/users") {
            let users = read_file("users.json");
            res.writeHead(200, options)
            res.end(JSON.stringify(users))
        }

        if (req.url == "/workers") {
            let workers = read_file("workers.json");
            res.writeHead(200, options)
            res.end(JSON.stringify(workers))
        }

        if (req.url == `/workers/${Id}`) {
            let workers = read_file("workers.json");
            res.writeHead(200, options)
            res.end(JSON.stringify(result, null, 4))
        }

        if (req.url == `/branches/${Id}`) {
            let branches = read_file("branches.json");
            let products = read_file("products.json");
            let workers = read_file("workers.json");
            let result
            let array = []
            branches.find(branch => {
                if (branch.branchId == Id) {
                    products.find(product => {
                        if (product.branchId == branch.branchId) {
                            array.push(product);
                        }
                    })
                    branch.products = array
                    array = [];
                    workers.find(worker => {
                        if (worker.branchId == branch.branchId) {
                            array.push(worker);
                        }
                    })
                    branch.workers = array
                    result = branch
                }
            })
            res.writeHead(200, options)
            res.end(JSON.stringify(result, null, 4))
        }

        if (req.url == `/markets/${Id}`) {
            let markets = read_file("markets.json");
            let branches = read_file("branches.json");
            let workers = read_file("workers.json");
            let products = read_file("products.json");
            let result
            let array = [], array1 = [], array2 = [];
            markets.find(market => {
                if (market.marketId == Id) {
                    array1 = [];
                    array2 = [];
                    branches.find(branch => {
                        if (branch.marketId == market.marketId) {
                            products.find(product => {
                                if (product.branchId == branch.branchId) {
                                    array1.push(product);
                                }
                            })
                            branch.products = array1
                            workers.find(worker => {
                                if (worker.branchId == branch.branchId) {
                                    array2.push(worker);
                                }
                            })
                            branch.workers = array2
                            array.push(branch)
                        }
                    })
                    market.branches = array
                    result = market
                }
            })
            res.writeHead(200, options)
            res.end(JSON.stringify(result, null, 4))
        }

        if (req.url == `/users/${Id}`) {
            let users = read_file("users.json");
            let result
            users.find(user => {
                if (user.id == Id) {
                    result = user
                }
            })
            res.writeHead(200, options)
            res.end(JSON.stringify(result, null, 4))
        }

        if (req.url == `/products/${Id}`) {
            let products = read_file("products.json");
            let result
            products.find(product => {
                if (product.id == Id) {
                    result = product
                }
            })
            res.writeHead(200, options)
            res.end(JSON.stringify(result, null, 4))
        }
    }

    if (req.method === 'POST') {
        if (req.url == '/login') {
            req.on('data', (chunk) => {
                let { name, password } = JSON.parse(chunk);
                let users = read_file('users.json')
                let result
                users.find(user => {
                    if (user.name == name && user.password == password) {
                        result = user
                    }
                })
                console.log(result);
                let token = jwt.sign({ id: result.id }, "SECRET_KEY", {
                    expiresIn: '2h'
                })
                res.writeHead(200, options)
                res.end(JSON.stringify({ token }))
            })
        }

        if (req.url == '/markets') {
            req.on('data', async (chunk) => {
                let { name } = JSON.parse(chunk);
                let userToken = await jwt.verify(req.headers.authorization, "SECRET_KEY")
                if (userToken) {
                    let markets = read_file('markets.json');
                    markets.push({ marketId: markets.length + 1, name: name });
                    write_file('markets.json', markets)
                    res.writeHead(200, options)
                    res.end("Created!")
                }
            })
        }

        if (req.url == '/branches') {
            req.on('data', async (chunk) => {
                let Branch = JSON.parse(chunk);
                let userToken = await jwt.verify(req.headers.authorization, "SECRET_KEY")
                if (!userToken) {
                    let branches = read_file('branches.json');
                    branches.push({ branchId: branches.length + 1, ...Branch });
                    write_file('branches.json', branches)
                    res.writeHead(200, options)
                    res.end("Created!")
                }
            })
        }

        if (req.url == '/workers') {
            req.on('data', async (chunk) => {
                let Worker = JSON.parse(chunk);
                let userToken = await jwt.verify(req.headers.authorization, "SECRET_KEY")
                let workers = read_file('workers.json');
                workers.push({ id: workers.length + 1, ...Worker });
                write_file('workers.json', workers)
                res.writeHead(200, options)
                res.end("Created!")
            })
        }

        if (req.url == '/products') {
            req.on('data', async (chunk) => {
                let Product = JSON.parse(chunk);
                let userToken = await jwt.verify(req.headers.authorization, "SECRET_KEY")
                let products = read_file('products.json');
                products.push({ id: products.length + 1, ...Product });
                write_file('products.json', products)
                res.writeHead(200, options)
                res.end("Created!")
            })
        }
    }

    if (req.method === 'PUT') {
        let Id = req.url.split("/")[2];
        if (req.url == `/market/${Id}`) {
            req.on('data', async (chunk) => {
                let { name } = JSON.parse(chunk);
                let userToken = await jwt.verify(req.headers.authorization, "SECRET_KEY")
                if (userToken) {
                    let markets = read_file('markets.json');
                    markets.forEach(market => {
                        if (market.marketId == Id) {
                            market.name = name || market.name;
                        }
                    })
                    write_file('markets.json', markets)
                    res.writeHead(200, options)
                    res.end("Changed!")
                }
            })
        }

        if (req.url == `/branche/${Id}`) {
            req.on('data', async (chunk) => {
                let userToken = await jwt.verify(req.headers.authorization, "SECRET_KEY")
                let { name, address, marketId } = JSON.parse(chunk);
                if (userToken) {
                    let branches = read_file('branches.json');
                    branches.forEach(branche => {
                        if (branche.brancheId == Id) {
                            branche.name = name || branche.name;
                        }
                    })
                    write_file('branches.json', branches)
                    res.writeHead(200, options)
                    res.end("Changed!")
                }
            })
        }

        if (req.url == `/worker/${Id}`) {
            req.on('data', async (chunk) => {
                let userToken = await jwt.verify(req.headers.authorization, "SECRET_KEY")
                let { name, phoneNumber, branchId } = JSON.parse(chunk);
                if (userToken) {
                    let workers = read_file('workers.json');
                    workers.forEach(worker => {
                        if (worker.workerId == Id) {
                            worker.name = name || worker.name;
                        }
                    })
                    write_file('workers.json', workers)
                    res.writeHead(200, options)
                    res.end("Changed!")
                }
            })
        }

        if (req.url == `/product/${Id}`) {
            req.on('data', async (chunk) => {
                let { title, price, branchId } = JSON.parse(chunk);
                let products = read_file('products.json');
                products.forEach(product => {
                    if (product.productId == Id) {
                        product.name = name || product.name;
                    }
                })
                write_file('products.json', products)
                res.writeHead(200, options)
                res.end("Changed!")
            })
        }
    }

    if (req.method == 'DELETE') {
        let Id = req.url.split("/")[2];
        if (req.url == `/market/${Id}`) {
            let markets = read_file('markets.json');
            markets.forEach((market, inx) => {
                if (market.id == Id){
                    markets.splice(inx, 1)
                }
            })        
            write_file('markets.json', markets)
            res.writeHead(200, options)
            res.end("Deleted!")
        }

        if (req.url == `/branch/${Id}`) {
            let branches = read_file('branches.json');
            branches.forEach((branch, inx) => {
                if (branch.id == Id){
                    branches.splice(inx, 1)
                }
            })            
            write_file('branches.json', branches)
            res.writeHead(200, options)
            res.end("Deleted!")
        }

        if (req.url == `/worker/${Id}`) {
            let userToken = jwt.verify(req.headers.authorization, "SECRET_KEY")
            console.log(userToken);
            if (userToken) {
                let workers = read_file('workers.json');
                workers.forEach((worker, inx) => {
                    if (worker.id == Id){
                        workers.splice(inx, 1)
                    }
                })
                write_file('workers.json', workers)
                res.writeHead(200, options)
                res.end("Deleted!")
            }
        }

        if (req.url == `/product/${Id}`) {
            let userToken = jwt.verify(req.headers.authorization, "SECRET_KEY")
            if (userToken) {
                let products = read_file('products.json');
                products.forEach((product, inx) => {
                    if (product.id == Id){
                        products.splice(inx, 1)
                    }
                })
                write_file('products.json', products)
                res.writeHead(200, options)
                res.end("Deleted!")
            }
        }
    }

}).listen(PORT, () => {
    console.log(`PORT listen in ${PORT}!`);
})