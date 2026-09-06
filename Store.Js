/* ==========================================================
   THE VIRAL VOICE // SIGNAL SUPPLY
   Product rendering + local cart + sticker bundle pricing
   ========================================================== */

(() => {
  "use strict";

  /* ========================================================
     CONFIRMED PRICING

     Standard stickers:
     1 sticker = $5
     Any 2 = $8
     Complete 3-sticker set = $10

     Shirts and holographic sticker remain unpriced for now.
     ======================================================== */

  const PRICING = {
    stickerSingle: 5,
    stickerPair: 8,
    stickerCompleteSet: 10,
    shirt: null,
    holographicSticker: null
  };

  const STANDARD_STICKER_IDS = [
    "VV-SIG-001",
    "VV-SIG-002",
    "VV-SIG-003"
  ];

  const PRODUCTS = [
    {
      id: "VV-APP-001",
      category: "apparel",
      title: "Distressed Sigil Tee",
      image: "assets/merch-shirt-distressed-sigil.png",
      description: "Garment-dyed natural tee. Small distressed sigil front. Oversized Viral Voice and sigil back print.",
      badge: "Front + Back",
      price: PRICING.shirt,
      sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
      available: false,
      status: "COMING SOON"
    },
    {
      id: "VV-APP-002",
      category: "apparel",
      title: "Viral Voice Portrait Tee",
      image: "assets/merch-shirt-portrait.png",
      description: "Garment-dyed black tee with the Viral Voice portrait, sigil, and distressed broadcast artwork.",
      badge: "Portrait",
      price: PRICING.shirt,
      sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
      available: false,
      status: "COMING SOON"
    },
    {
      id: "VV-APP-003",
      category: "apparel",
      title: "True Believer Tee",
      image: "assets/merch-shirt-true-believer.png",
      description: "Garment-dyed black tee with the full I'M A TRUE BELIEVER front print and Think For Yourself message.",
      badge: "Movement",
      price: PRICING.shirt,
      sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
      available: false,
      status: "COMING SOON"
    },
    {
      id: "VV-SIG-001",
      category: "stickers",
      title: "Classic Sigil",
      image: "assets/merch-sticker-classic-sigil.png",
      description: "Clean cyan-on-black circular sigil marker.",
      badge: "Standard",
      price: PRICING.stickerSingle,
      available: true,
      bundleEligible: true,
      status: "$5 // BUNDLE ELIGIBLE"
    },
    {
      id: "VV-SIG-002",
      category: "stickers",
      title: "Distressed Sigil",
      image: "assets/merch-sticker-distressed-sigil.png",
      description: "Dripping, distressed version of the primary signal mark.",
      badge: "Standard",
      price: PRICING.stickerSingle,
      available: true,
      bundleEligible: true,
      status: "$5 // BUNDLE ELIGIBLE"
    },
    {
      id: "VV-SIG-003",
      category: "stickers",
      title: "Viral Voice Logo",
      image: "assets/merch-sticker-viral-voice.png",
      description: "Sigil plus full Viral Voice wordmark in one irregular die-cut piece.",
      badge: "Standard",
      price: PRICING.stickerSingle,
      available: true,
      bundleEligible: true,
      status: "$5 // BUNDLE ELIGIBLE"
    },
    {
      id: "VV-SIG-004",
      category: "stickers",
      title: "Holographic Sigil",
      image: "assets/merch-sticker-holographic.png",
      description: "Iridescent holographic signal mark with shifting color under light.",
      badge: "Holographic",
      price: PRICING.holographicSticker,
      available: false,
      status: "PRICE TBA"
    }
  ];

  const CART_KEY = "viral_voice_signal_supply_cart";
  let cart = loadCart().filter(item => getProduct(item.id)?.available);

  const grids = {
    apparel: document.querySelector('[data-product-grid="apparel"]'),
    stickers: document.querySelector('[data-product-grid="stickers"]')
  };

  function formatPrice(price) {
    if (typeof price !== "number") return "PRICE TBA";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  function productCard(product) {
    const hasSizes = Array.isArray(product.sizes);
    const priceClass = typeof product.price === "number" ? "" : " pending";
    const disabled = product.available ? "" : " disabled";
    const availabilityClass = product.available ? "" : " unavailable";

    const sizeMarkup = hasSizes
      ? `
        <select
          class="product-size"
          data-size
          aria-label="Select size"
          ${disabled}
        >
          ${product.sizes
            .map(size => `<option value="${size}">${size}</option>`)
            .join("")}
        </select>
      `
      : "";

    const buttonText = product.available
      ? "ACQUIRE ARTIFACT"
      : product.status;

    return `
      <article
        class="product-card${availabilityClass}"
        data-category="${product.category}"
        data-product-id="${product.id}"
      >
        <div class="product-visual">
          <span class="product-code">${product.id}</span>
          <span class="product-badge">${product.badge}</span>

          ${
            product.available
              ? ""
              : `<span class="product-status-overlay">${product.status}</span>`
          }

          <img
            src="${product.image}"
            alt="${product.title}"
            loading="lazy"
          />
        </div>

        <div class="product-body">
          <span class="product-category">
            ${
              product.category === "apparel"
                ? "APPAREL"
                : "SIGNAL MARKER"
            }
          </span>

          <h3 class="product-title">${product.title}</h3>

          <p class="product-description">
            ${product.description}
          </p>

          <div class="product-meta">
            <strong class="product-price${priceClass}">
              ${formatPrice(product.price)}
            </strong>

            ${sizeMarkup}
          </div>

          ${
            product.bundleEligible
              ? `
                <div class="bundle-note">
                  ANY 2 // $8
                  &nbsp;&nbsp;
                  COMPLETE 3-SET // $10
                </div>
              `
              : ""
          }

          <div class="product-actions">
            <button
              class="acquire-button"
              type="button"
              data-add="${product.id}"
              ${disabled}
            >
              ${buttonText}
            </button>

            <button
              class="quick-button"
              type="button"
              data-add="${product.id}"
              aria-label="Add ${product.title} to cart"
              ${disabled}
            >
              +
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderProducts() {
    Object.entries(grids).forEach(([category, grid]) => {
      if (!grid) return;

      grid.innerHTML = PRODUCTS
        .filter(product => product.category === category)
        .map(productCard)
        .join("");
    });
  }

  function loadCart() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(CART_KEY)
      );

      return Array.isArray(saved)
        ? saved
        : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

    renderCart();
  }

  function getProduct(id) {
    return PRODUCTS.find(
      product => product.id === id
    );
  }

  function addToCart(id, sourceButton) {
    const product = getProduct(id);

    if (!product || !product.available) return;

    const card = sourceButton.closest(".product-card");

    const size =
      card?.querySelector("[data-size]")?.value || null;

    const key = `${id}:${size || "default"}`;

    const existing = cart.find(
      item => item.key === key
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        key,
        id,
        size,
        quantity: 1
      });
    }

    saveCart();
    openCart();
  }

  function changeQuantity(key, delta) {
    const item = cart.find(
      entry => entry.key === key
    );

    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
      cart = cart.filter(
        entry => entry.key !== key
      );
    }

    saveCart();
  }

  function removeItem(key) {
    cart = cart.filter(
      entry => entry.key !== key
    );

    saveCart();
  }

  /* ========================================================
     STANDARD STICKER BUNDLE PRICING

     Optimization rules:

     One of each standard design = $10 complete set
     Any remaining pair = $8
     Any remaining single = $5

     Examples:

     1 sticker = $5
     2 stickers = $8
     3 different stickers = $10
     3 of same sticker = $13
     4 stickers = $15
     ======================================================== */

  function calculateStickerPricing() {
    const quantities = Object.fromEntries(
      STANDARD_STICKER_IDS.map(id => [id, 0])
    );

    cart.forEach(item => {
      if (
        STANDARD_STICKER_IDS.includes(item.id)
      ) {
        quantities[item.id] += item.quantity;
      }
    });

    const completeSets = Math.min(
      ...STANDARD_STICKER_IDS.map(
        id => quantities[id]
      )
    );

    STANDARD_STICKER_IDS.forEach(id => {
      quantities[id] -= completeSets;
    });

    const remainingQty =
      STANDARD_STICKER_IDS.reduce(
        (sum, id) => sum + quantities[id],
        0
      );

    const pairs = Math.floor(
      remainingQty / 2
    );

    const singles =
      remainingQty % 2;

    const total =
      completeSets * PRICING.stickerCompleteSet +
      pairs * PRICING.stickerPair +
      singles * PRICING.stickerSingle;

    return {
      total,
      completeSets,
      pairs,
      singles,
      quantity:
        completeSets * 3 +
        remainingQty
    };
  }

  function calculateCartTotal() {
    const stickerPricing =
      calculateStickerPricing();

    const nonStickerTotal =
      cart.reduce((sum, item) => {
        if (
          STANDARD_STICKER_IDS.includes(
            item.id
          )
        ) {
          return sum;
        }

        const product =
          getProduct(item.id);

        if (
          !product ||
          typeof product.price !== "number"
        ) {
          return sum;
        }

        return (
          sum +
          product.price * item.quantity
        );
      }, 0);

    return {
      total:
        stickerPricing.total +
        nonStickerTotal,

      stickerPricing
    };
  }

  function bundleSummary(pricing) {
    const parts = [];

    if (pricing.completeSets) {
      parts.push(
        `${pricing.completeSets} COMPLETE 3-SET${
          pricing.completeSets > 1
            ? "S"
            : ""
        }`
      );
    }

    if (pricing.pairs) {
      parts.push(
        `${pricing.pairs} TWO-STICKER DEAL${
          pricing.pairs > 1
            ? "S"
            : ""
        }`
      );
    }

    if (pricing.singles) {
      parts.push(
        `${pricing.singles} SINGLE`
      );
    }

    return parts.join(" // ");
  }

  function renderCart() {
    const container =
      document.querySelector(
        "[data-cart-items]"
      );

    const empty =
      document.querySelector(
        "[data-cart-empty]"
      );

    const total =
      document.querySelector(
        "[data-cart-total]"
      );

    const bundle =
      document.querySelector(
        "[data-cart-bundle]"
      );

    const counts =
      document.querySelectorAll(
        "[data-cart-count]"
      );

    const count =
      cart.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );

    counts.forEach(
      node =>
        node.textContent = String(count)
    );

    if (
      !container ||
      !empty ||
      !total
    ) {
      return;
    }

    empty.hidden =
      cart.length > 0;

    container.hidden =
      cart.length === 0;

    container.innerHTML =
      cart
        .map(item => {
          const product =
            getProduct(item.id);

          if (!product) return "";

          const lineLabel =
            product.bundleEligible
              ? "$5 EACH // BUNDLE PRICING AT SUBTOTAL"
              : formatPrice(
                  product.price
                );

          return `
            <div class="cart-item">
              <img
                src="${product.image}"
                alt=""
              />

              <div class="cart-item-copy">
                <strong>
                  ${product.title}
                </strong>

                <span>
                  ${
                    item.size
                      ? `SIZE ${item.size} // `
                      : ""
                  }

                  ${lineLabel}
                </span>

                <div class="cart-item-tools">
                  <button
                    type="button"
                    data-qty="-1"
                    data-key="${item.key}"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <b>
                    ${item.quantity}
                  </b>

                  <button
                    type="button"
                    data-qty="1"
                    data-key="${item.key}"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                class="cart-remove"
                type="button"
                data-remove="${item.key}"
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
          `;
        })
        .join("");

    const pricing =
      calculateCartTotal();

    total.textContent =
      cart.length
        ? formatPrice(pricing.total)
        : "$0";

    if (bundle) {
      const summary =
        bundleSummary(
          pricing.stickerPricing
        );

      bundle.textContent =
        summary
          ? `BUNDLE PRICING APPLIED // ${summary}`
          : "";

      bundle.hidden =
        !summary;
    }
  }

  function openCart() {
    document.body.classList.add(
      "cart-open"
    );

    document
      .querySelector(".cart-drawer")
      ?.setAttribute(
        "aria-hidden",
        "false"
      );
  }

  function closeCart() {
    document.body.classList.remove(
      "cart-open"
    );

    document
      .querySelector(".cart-drawer")
      ?.setAttribute(
        "aria-hidden",
        "true"
      );
  }

  function setFilter(filter) {
    document
      .querySelectorAll(".filter-button")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.filter === filter
        );
      });

    document
      .querySelectorAll(".product-card")
      .forEach(card => {
        const visible =
          filter === "all" ||
          card.dataset.category === filter;

        card.classList.toggle(
          "product-hidden",
          !visible
        );
      });
  }

  document.addEventListener(
    "click",
    event => {
      const addButton =
        event.target.closest(
          "[data-add]"
        );

      if (addButton) {
        addToCart(
          addButton.dataset.add,
          addButton
        );

        return;
      }

      const filterButton =
        event.target.closest(
          "[data-filter]"
        );

      if (filterButton) {
        setFilter(
          filterButton.dataset.filter
        );

        return;
      }

      if (
        event.target.closest(
          "[data-cart-open]"
        )
      ) {
        openCart();
        return;
      }

      if (
        event.target.closest(
          "[data-cart-close]"
        )
      ) {
        closeCart();
        return;
      }

      const qtyButton =
        event.target.closest(
          "[data-qty]"
        );

      if (qtyButton) {
        changeQuantity(
          qtyButton.dataset.key,
          Number(
            qtyButton.dataset.qty
          )
        );

        return;
      }

      const removeButton =
        event.target.closest(
          "[data-remove]"
        );

      if (removeButton) {
        removeItem(
          removeButton.dataset.remove
        );
      }
    }
  );

  document.addEventListener(
    "keydown",
    event => {
      if (event.key === "Escape") {
        closeCart();
      }
    }
  );

  renderProducts();
  renderCart();
})();
