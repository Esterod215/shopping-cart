//variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const shopBtn = document.querySelector(".shop-btn");
console.log("shop-btn,", shopBtn);
//cart
let cart = [];
//buttons
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      const data = await result.json();

      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      console.log(products);
      return products;
    } catch (error) {
      console.log("err", error);
    }
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
        <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product-1" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
        `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "Already in cart";
        button.diabled = true;
      }
      button.addEventListener("click", e => {
        event.target.innerText = "Already in cart";
        event.target.disabled = true;
        let cartItem = { ...Storage.getProducts(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.addCartItem(cartItem);
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    console.log("heree", cartItems, cartTotal);
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img  src=${item.image} alt="product ${item.id}">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                        </div>`;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    shopBtn.addEventListener("click", e => {
      smoothScroll(".products", 1000);
    });
  }
  populate(cart) {
    cart.forEach(item => {
      this.addCartItem(item);
    });
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart(); //we want this to refer to UI class so its put in an anonymous fuction
    });
    cartContent.addEventListener("click", e => {
      if (event.target.classList.contains("remove-item")) {
        cartContent.removeChild(event.target.parentElement.parentElement);
        this.removeItem(event.target.dataset.id);
        this.hideCart();
      } else if (event.target.classList.contains("fa-chevron-up")) {
        console.log(event.target);
        let tempItem = cart.find(item => item.id === event.target.dataset.id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        event.target.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let tempItem = cart.find(item => item.id === event.target.dataset.id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          event.target.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(event.target.parentElement.parentElement);
          this.removeItem(event.target.dataset.id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id != id);
    console.log(cart);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(item => item.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    if (localStorage.getItem("cart") != undefined) {
      console.log("true");

      return JSON.parse(localStorage.getItem("cart"));
    } else {
      return [];
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();

  //get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
function smoothScroll() {
  window.scrollTo(0, 610);
}
