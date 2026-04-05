import MySQLdb
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import bcrypt
import os
from werkzeug.utils import secure_filename
import json

app = Flask(__name__)
CORS(app)

# ===== DB CONFIG =====
app.config["MYSQL_HOST"] = os.environ.get("MYSQLHOST")
app.config["MYSQL_USER"] = os.environ.get("MYSQLUSER")
app.config["MYSQL_PASSWORD"] = os.environ.get("MYSQLPASSWORD")
app.config["MYSQL_DB"] = os.environ.get("MYSQLDATABASE")
app.config["MYSQL_PORT"] = int(os.environ.get("MYSQLPORT", 3306))

mysql = MySQL(app)

# ===== UPLOAD FOLDER =====
UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ===== HOME =====
@app.route("/")
def home():
    return "Backend Running 🚀"


# ===== SIGNUP =====
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode("utf-8")
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            "INSERT INTO users(name, email, password) VALUES(%s,%s,%s)",
            (name, email, hashed),
        )
        mysql.connection.commit()
        return jsonify({"success": True})
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Signup failed"}), 400
    finally:
        cur.close()


# ===== LOGIN =====
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close()

    if user and bcrypt.checkpw(password.encode(), user[2].encode()):
        return jsonify({"success": True, "user_id": user[0], "email": user[1]})
    else:
        return jsonify({"success": False}), 401


# ===== GET PRODUCTS =====
@app.route("/products", methods=["GET"])
def get_products():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM products")
    data = cur.fetchall()
    cur.close()

    result = []
    for p in data:
        result.append(
            {"id": p[0], "name": p[1], "price": p[2], "image": p[3], "type": p[4]}
        )
    return jsonify(result)


# ===== ADD PRODUCT =====
@app.route("/add-product", methods=["POST"])
def add_product():
    data = request.json
    name = data.get("name")
    price = data.get("price")
    image = data.get("image")
    type_ = data.get("type")

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO products (name, price, image, type) VALUES (%s,%s,%s,%s)",
        (name, price, image, type_),
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True, "message": "Product added ✅"})


# ===== DELETE PRODUCT =====
@app.route("/delete-product/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM products WHERE id=%s", (product_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True})


# ===== CART ROUTES =====
@app.route("/cart/add", methods=["POST"])
def add_to_cart():
    data = request.json
    user_id = data.get("user_id")
    product_id = data.get("product_id")

    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT id, quantity FROM cart WHERE user_id=%s AND product_id=%s",
        (user_id, product_id),
    )
    existing = cur.fetchone()

    if existing:
        cart_id, qty = existing
        cur.execute("UPDATE cart SET quantity=%s WHERE id=%s", (qty + 1, cart_id))
    else:
        cur.execute(
            "SELECT name, price, image FROM products WHERE id=%s", (product_id,)
        )
        product = cur.fetchone()
        if not product:
            return jsonify({"success": False, "message": "Product not found"})
        name, price, image = product
        cur.execute(
            """
            INSERT INTO cart (user_id, product_id, name, price, image, quantity)
            VALUES (%s, %s, %s, %s, %s, 1)
        """,
            (user_id, product_id, name, price, image),
        )
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True})


@app.route("/cart/<int:user_id>", methods=["GET"])
def get_cart(user_id):
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT id, product_id, name, price, image, quantity FROM cart WHERE user_id=%s",
        (user_id,),
    )
    items = cur.fetchall()
    cur.close()

    cart = []
    for item in items:
        cart.append(
            {
                "id": item[0],
                "product_id": item[1],
                "name": item[2],
                "price": item[3],
                "image": item[4],
                "quantity": item[5],
            }
        )
    return jsonify(cart)


@app.route("/cart/update", methods=["POST"])
def update_cart():
    data = request.json
    cart_id = data.get("cart_id")
    action = data.get("action")

    cur = mysql.connection.cursor()
    cur.execute("SELECT quantity FROM cart WHERE id=%s", (cart_id,))
    item = cur.fetchone()
    if not item:
        return jsonify({"success": False})
    qty = item[0]
    if action == "inc":
        qty += 1
    elif action == "dec":
        qty -= 1
    if qty <= 0:
        cur.execute("DELETE FROM cart WHERE id=%s", (cart_id,))
    else:
        cur.execute("UPDATE cart SET quantity=%s WHERE id=%s", (qty, cart_id))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True, "newQty": qty})


@app.route("/cart/remove", methods=["POST"])
def remove_item():
    data = request.json
    cart_id = data.get("cart_id")
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM cart WHERE id=%s", (cart_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True})


# ===== USER PROFILE + UPLOAD =====
@app.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, name, email, image FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()
    cur.close()
    if user:
        return jsonify(
            {"id": user[0], "name": user[1], "email": user[2], "image": user[3]}
        )
    return jsonify({"success": False}), 404


@app.route("/upload-profile", methods=["POST"])
def upload_profile():
    file = request.files.get("image")
    user_id = request.form.get("user_id")
    if not file:
        return jsonify({"success": False, "message": "No file"})
    filename = secure_filename(file.filename)
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)
    image_url = f"{request.host_url}static/uploads/{filename}"
    cur = mysql.connection.cursor()
    cur.execute("UPDATE users SET image=%s WHERE id=%s", (image_url, user_id))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True, "image": image_url})


# ===== RESET PASSWORD =====
@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email")
    new_password = data.get("password")
    if not email or not new_password:
        return jsonify({"success": False, "message": "Missing data"}), 400
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cur.fetchone()
    if not user:
        return jsonify({"success": False, "message": "Email not found"}), 404
    hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    cur.execute("UPDATE users SET password=%s WHERE email=%s", (hashed_password, email))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True, "message": "Password updated successfully"})


# ===== ORDERS =====
@app.route("/orders/create", methods=["POST"])
def create_order():
    data = request.json
    user_id = data.get("user_id")
    name = data.get("name")
    phone = data.get("phone")
    address = data.get("address")
    total = data.get("total")
    payment = data.get("payment")
    # Include image and price in items for admin.js
    items_list = []
    for i in data.get("items", []):
        items_list.append(
            {
                "product_id": i.get("product_id"),
                "name": i.get("name"),
                "quantity": i.get("quantity"),
                "price": i.get("price"),
                "image": i.get("image"),
            }
        )
    items = json.dumps(items_list)
    status = "Processing"

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO orders (user_id, name, phone, address, total, payment, status, items) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
        (user_id, name, phone, address, total, payment, status, items),
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True})


# ===== USER ORDERS =====
@app.route("/orders/<int:user_id>", methods=["GET"])
def get_orders(user_id):
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT id,user_id,name,phone,address,total,payment,status,date,items "
        "FROM orders WHERE user_id=%s",
        (user_id,),
    )
    data = cur.fetchall()
    cur.close()
    orders = []
    for o in data:
        try:
            raw_items = json.loads(o[9]) if o[9] else []
        except:
            raw_items = []
        items = []
        for i in raw_items:
            items.append(
                {"name": i.get("name") or "Item", "quantity": i.get("quantity") or 1}
            )
        orders.append(
            {
                "id": o[0],
                "user_id": o[1],
                "name": o[2],
                "phone": o[3],
                "address": o[4],
                "total": o[5],
                "payment": o[6],
                "status": o[7],
                "date": o[8],
                "items": items,
            }
        )
    return jsonify(orders)


# User deletes an order
@app.route("/order/delete", methods=["POST"])
def delete_order():
    data = request.json
    order_id = data.get("order_id")
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM orders WHERE id=%s", (order_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True})


# Admin gets all orders
@app.route("/admin/orders", methods=["GET"])
def get_all_orders():
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT id,user_id,name,phone,address,total,payment,status,date,items "
        "FROM orders ORDER BY id DESC"
    )
    data = cur.fetchall()
    cur.close()
    orders = []
    for o in data:
        try:
            raw_items = json.loads(o[9]) if o[9] else []
        except:
            raw_items = []
        items = []
        for i in raw_items:
            items.append(
                {
                    "name": i.get("name") or "Item",
                    "quantity": i.get("quantity") or 1,
                    "image": i.get("image") or "",
                }
            )
        orders.append(
            {
                "id": o[0],
                "user_id": o[1],
                "name": o[2],
                "phone": o[3],
                "address": o[4],
                "total": o[5],
                "payment": o[6],
                "status": o[7],
                "date": o[8],
                "items": items,
            }
        )
    return jsonify(orders)


# Admin updates order status
@app.route("/admin/update-status", methods=["POST"])
def update_status():
    data = request.json
    order_id = data.get("order_id")
    status = data.get("status")
    cur = mysql.connection.cursor()
    cur.execute("UPDATE orders SET status=%s WHERE id=%s", (status, order_id))
    mysql.connection.commit()
    cur.close()
    return jsonify({"success": True})


# Detailed order info
@app.route("/order/<int:order_id>", methods=["GET"])
def get_single_order(order_id):
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT id,user_id,name,phone,address,total,payment,status,date,items "
        "FROM orders WHERE id=%s",
        (order_id,),
    )
    o = cur.fetchone()
    cur.close()
    if not o:
        return jsonify({})
    try:
        raw_items = json.loads(o[9]) if o[9] else []
    except:
        raw_items = []
    items = []
    for i in raw_items:
        items.append(
            {
                "name": i.get("name") or "Item",
                "quantity": i.get("quantity") or 1,
                "image": i.get("image") or "",
                "price": i.get("price") or 0,
            }
        )
    return jsonify(
        {
            "id": o[0],
            "name": o[2],
            "phone": o[3],
            "address": o[4],
            "total": o[5],
            "payment": o[6],
            "status": o[7],
            "date": o[8],
            "items": items,
        }
    )


# ===== RUN =====
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
