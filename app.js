/**
 * PIZZA OS - SCREEN-TO-SCREEN INTERACTIVE MOCKUP ENGINE
 * Complete Mobile Stack Navigator + B2B Live Order Lifecycle
 */

// =============================================================================
// 1. SOUND SYNTHESIS ENGINE (Web Audio API)
// =============================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  play(type = 'click') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'new_order') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'advance') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn('Audio err:', e);
    }
  }
}

const audio = new SoundEngine();

// =============================================================================
// 2. CENTRAL DATA STORE
// =============================================================================
const ORDER_STATES = {
  TOMADO: 'TOMADO',
  ACEPTADO: 'ACEPTADO',
  PREPARACION: 'PREPARACION',
  DESPACHADO: 'DESPACHADO',
  ENTREGADO: 'ENTREGADO'
};

const PIZZA_CATALOG = [
  {
    id: 'p1',
    name: 'Pepperoni Suprema',
    desc: 'Doble pepperoni artesanal curado, mozzarella di bufala y salsa San Marzano.',
    basePrice: 28900,
    emoji: '🍕',
    sizes: { personal: 19900, mediana: 28900, familiar: 39900 }
  },
  {
    id: 'p2',
    name: 'Margherita Clásica DOP',
    desc: 'Albahaca fresca, mozzarella fresca, aceite de oliva extra virgen y reducción de balsámico.',
    basePrice: 24900,
    emoji: '🌿',
    sizes: { personal: 16900, mediana: 24900, familiar: 34900 }
  },
  {
    id: 'p3',
    name: 'Cuatro Quesos Trufada',
    desc: 'Gorgonzola, fontina, parmigiano reggiano, mozzarella y gotas de aceite de trufa blanca.',
    basePrice: 32900,
    emoji: '🧀',
    sizes: { personal: 22900, mediana: 32900, familiar: 44900 }
  },
  {
    id: 'p4',
    name: 'BBQ Pollo & Tocino',
    desc: 'Pechuga ahumada al horno de leña, tocineta crujiente, cebolla morada y barbacoa artesanal.',
    basePrice: 29900,
    emoji: '🥓',
    sizes: { personal: 20900, mediana: 29900, familiar: 41900 }
  }
];

const DRIVERS = [
  { id: 'd1', name: 'Carlos Mendoza', vehicle: 'Moto Honda 160 (PK-92)', phone: '+57 312 458 9012' },
  { id: 'd2', name: 'Andrea Gómez', vehicle: 'Bici Eléctrica #04', phone: '+57 300 789 4433' },
  { id: 'd3', name: 'Mario Rossi', vehicle: 'Scooter Yamaha (XZ-11)', phone: '+57 315 221 8899' }
];

class PizzaStore {
  constructor() {
    this.orders = [
      {
        id: 'PZ-7821',
        customer: 'Santiago Botero',
        phone: '+57 310 998 1234',
        address: 'Calle 93 #14-20, Apto 501',
        channel: 'APP',
        state: ORDER_STATES.TOMADO,
        items: [{ name: 'Pepperoni Suprema (Mediana)', customs: 'Borde de Queso + Champiñones', price: 34900 }],
        total: 34900,
        createdAt: new Date(Date.now() - 4 * 60000),
        driverId: null,
        pin: '5812'
      },
      {
        id: 'PZ-7820',
        customer: 'Valeria Restrepo',
        phone: '+57 316 443 8901',
        address: 'Cra 11 #85-32, Of. 402',
        channel: 'WEB',
        state: ORDER_STATES.ACEPTADO,
        items: [{ name: 'Margherita Clásica (Familiar)', customs: 'Masa Artesanal Delgada', price: 34900 }],
        total: 34900,
        createdAt: new Date(Date.now() - 11 * 60000),
        driverId: null,
        pin: '2390'
      },
      {
        id: 'PZ-7819',
        customer: 'Andrés Morales',
        phone: '+57 315 776 2200',
        address: 'Calle 72 #9-15',
        channel: 'APP',
        state: ORDER_STATES.PREPARACION,
        items: [{ name: 'Cuatro Quesos Trufada (Mediana)', customs: 'Extra Parmigiano', price: 32900 }],
        total: 32900,
        createdAt: new Date(Date.now() - 18 * 60000),
        driverId: 'd1',
        pin: '9041'
      },
      {
        id: 'PZ-7818',
        customer: 'Camila Díaz',
        phone: '+57 301 223 5589',
        address: 'Diagonal 108 #19-45',
        channel: 'APP',
        state: ORDER_STATES.DESPACHADO,
        items: [{ name: 'BBQ Pollo & Tocino (Familiar)', customs: 'Cebolla extra', price: 41900 }],
        total: 41900,
        createdAt: new Date(Date.now() - 28 * 60000),
        driverId: 'd2',
        pin: '1182'
      },
      {
        id: 'PZ-7815',
        customer: 'Cliente Mostrador POS',
        phone: 'N/A',
        address: 'Consumo Local - Mesa 2',
        channel: 'POS',
        state: ORDER_STATES.ENTREGADO,
        items: [{ name: 'Pepperoni Suprema (Personal)', customs: 'Combo Almuerzo', price: 19900 }],
        total: 19900,
        createdAt: new Date(Date.now() - 50 * 60000),
        driverId: null,
        pin: '0000'
      }
    ];

    // Mobile App active cart
    this.cart = [
      {
        pizzaId: 'p1',
        name: 'Pepperoni Suprema',
        size: 'Mediana',
        crust: 'Borde de Queso (+4.5k)',
        toppings: ['Champiñones Frescos'],
        price: 36400,
        qty: 1
      }
    ];

    // Mobile app currently viewed/tracked order ID
    this.activeTrackingOrderId = 'PZ-7821';

    // B2B Channel Filter
    this.b2bFilter = 'ALL';

    // Subscriptions
    this.subscribers = [];
  }

  subscribe(fn) {
    this.subscribers.push(fn);
  }

  notify() {
    this.subscribers.forEach(fn => fn(this));
  }

  advanceOrder(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.state === ORDER_STATES.TOMADO) {
      order.state = ORDER_STATES.ACEPTADO;
      audio.play('advance');
    } else if (order.state === ORDER_STATES.ACEPTADO) {
      order.state = ORDER_STATES.PREPARACION;
      if (!order.driverId) order.driverId = DRIVERS[0].id;
      audio.play('advance');
    } else if (order.state === ORDER_STATES.PREPARACION) {
      order.state = ORDER_STATES.DESPACHADO;
      if (!order.driverId) order.driverId = DRIVERS[0].id;
      audio.play('advance');
    } else if (order.state === ORDER_STATES.DESPACHADO) {
      order.state = ORDER_STATES.ENTREGADO;
      audio.play('advance');
    }
    this.notify();
  }

  createOrderFromCart(customerData) {
    const newId = 'PZ-' + Math.floor(1000 + Math.random() * 9000);
    const subtotal = this.cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const deliveryFee = 4500;
    const total = subtotal + deliveryFee;

    const order = {
      id: newId,
      customer: customerData.name || 'Cliente App Móvil',
      phone: customerData.phone || '+57 312 889 4012',
      address: customerData.address || 'Calle 93 #14-20, Apto 501',
      channel: 'APP',
      state: ORDER_STATES.TOMADO,
      items: this.cart.map(i => ({
        name: `${i.name} (${i.size})`,
        customs: `${i.crust}${i.toppings.length ? ', ' + i.toppings.join(', ') : ''}`,
        price: i.price * i.qty
      })),
      total: total,
      createdAt: new Date(),
      driverId: null,
      pin: Math.floor(1000 + Math.random() * 9000).toString()
    };

    this.orders.unshift(order);
    this.activeTrackingOrderId = order.id;
    this.cart = []; // empty cart
    audio.play('new_order');
    this.notify();
    return order;
  }
}

const store = new PizzaStore();

// =============================================================================
// 3. SMARTPHONE SCREEN-TO-SCREEN STACK NAVIGATOR
// =============================================================================
class MobileNavigator {
  constructor() {
    this.screens = {
      splash: document.getElementById('screen-splash'),
      catalog: document.getElementById('screen-catalog'),
      customizer: document.getElementById('screen-customizer'),
      cart: document.getElementById('screen-cart'),
      checkout: document.getElementById('screen-checkout'),
      success: document.getElementById('screen-success'),
      tracking: document.getElementById('screen-tracking')
    };

    this.stack = ['splash'];
    this.currentScreen = 'splash';

    // State for pizza being customized right now
    this.customizingPizza = PIZZA_CATALOG[0];
    this.selectedSize = 'mediana';
    this.selectedCrust = 'queso';
    this.selectedToppings = ['Champiñones Frescos'];
  }

  init() {
    this.goTo('splash');
  }

  goTo(screenName, options = {}) {
    if (!this.screens[screenName]) return;
    audio.play('click');

    const previous = this.screens[this.currentScreen];
    const next = this.screens[screenName];

    // Deactivate previous
    if (previous && previous !== next) {
      previous.classList.remove('active-screen');
      previous.classList.add('slide-left');
      setTimeout(() => previous.classList.remove('slide-left'), 350);
    }

    // Activate next
    next.classList.add('active-screen');
    this.currentScreen = screenName;
    this.stack.push(screenName);

    // Update bottom nav active state
    this.updateBottomNav(screenName);

    // Update presenter pills
    document.querySelectorAll('.flow-step-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-target') === screenName);
    });

    // Render screen contents dynamically if needed
    if (screenName === 'customizer') this.renderCustomizer();
    if (screenName === 'cart') this.renderCart();
    if (screenName === 'checkout') this.renderCheckout();
    if (screenName === 'tracking') this.renderTracking();
  }

  goBack() {
    if (this.stack.length <= 1) return;
    audio.play('click');

    this.stack.pop(); // pop current
    const prevScreenName = this.stack[this.stack.length - 1] || 'catalog';

    const currentEl = this.screens[this.currentScreen];
    const prevEl = this.screens[prevScreenName];

    if (currentEl) currentEl.classList.remove('active-screen');
    if (prevEl) prevEl.classList.add('active-screen');

    this.currentScreen = prevScreenName;
    this.updateBottomNav(prevScreenName);

    document.querySelectorAll('.flow-step-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-target') === prevScreenName);
    });
  }

  updateBottomNav(screenName) {
    const bottomNav = document.getElementById('phone-bottom-nav');
    if (!bottomNav) return;

    // Hide bottom nav on splash or success
    if (screenName === 'splash' || screenName === 'success') {
      bottomNav.style.display = 'none';
    } else {
      bottomNav.style.display = 'flex';
    }

    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.classList.remove('active');
    });

    if (screenName === 'catalog' || screenName === 'customizer') {
      document.getElementById('bnav-home')?.classList.add('active');
    } else if (screenName === 'cart' || screenName === 'checkout') {
      document.getElementById('bnav-cart')?.classList.add('active');
    } else if (screenName === 'tracking') {
      document.getElementById('bnav-orders')?.classList.add('active');
    }

    // Update cart badge
    const badge = document.getElementById('cart-badge-count');
    if (badge) {
      const count = store.cart.reduce((s, i) => s + i.qty, 0);
      badge.style.display = count > 0 ? 'flex' : 'none';
      badge.innerText = count;
    }
  }

  startCustomizing(pizzaId) {
    this.customizingPizza = PIZZA_CATALOG.find(p => p.id === pizzaId) || PIZZA_CATALOG[0];
    this.selectedSize = 'mediana';
    this.selectedCrust = 'artesanal';
    this.selectedToppings = [];
    this.goTo('customizer');
  }

  renderCustomizer() {
    const pizza = this.customizingPizza;
    document.getElementById('custom-pizza-title').innerText = pizza.name;
    document.getElementById('custom-pizza-desc').innerText = pizza.desc;
    document.getElementById('custom-pizza-emoji').innerText = pizza.emoji;
    this.updateCustomizerPrice();
  }

  updateCustomizerPrice() {
    const pizza = this.customizingPizza;
    let price = pizza.sizes[this.selectedSize] || pizza.basePrice;
    if (this.selectedCrust === 'queso') price += 4500;
    price += (this.selectedToppings.length * 3500);

    document.getElementById('custom-calc-price').innerText = formatMoney(price);
    return price;
  }

  addToCartFromCustomizer() {
    const finalPrice = this.updateCustomizerPrice();
    store.cart.push({
      pizzaId: this.customizingPizza.id,
      name: this.customizingPizza.name,
      size: this.selectedSize.toUpperCase(),
      crust: this.selectedCrust === 'queso' ? 'Borde de Queso (+4.5k)' : 'Masa Artesanal Delgada',
      toppings: [...this.selectedToppings],
      price: finalPrice,
      qty: 1
    });

    audio.play('click');
    this.goTo('cart');
  }

  renderCart() {
    const list = document.getElementById('cart-items-list');
    if (!list) return;

    if (store.cart.length === 0) {
      list.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
          <div style="font-size:3rem; margin-bottom:0.5rem;">🛒</div>
          <p>Tu carrito está vacío</p>
          <button class="btn-splash-start" style="margin-top:1rem; padding:0.6rem;" onclick="mobileNav.goTo('catalog')">
            Explorar Menú
          </button>
        </div>
      `;
      document.getElementById('cart-bill-section').style.display = 'none';
      return;
    }

    document.getElementById('cart-bill-section').style.display = 'block';

    list.innerHTML = store.cart.map((item, idx) => `
      <div class="cart-item-row">
        <div>
          <div style="font-weight:700; color:#fff; font-size:0.88rem;">${item.name} (${item.size})</div>
          <div style="font-size:0.72rem; color:var(--pizza-orange-light);">${item.crust}</div>
          ${item.toppings.length ? `<div style="font-size:0.7rem; color:var(--text-muted);">${item.toppings.join(', ')}</div>` : ''}
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800; color:#fff; font-size:0.92rem;">${formatMoney(item.price * item.qty)}</div>
          <button style="background:none; border:none; color:var(--pizza-red); font-size:0.72rem; cursor:pointer;" onclick="removeItemFromCart(${idx})">
            Eliminar
          </button>
        </div>
      </div>
    `).join('');

    const subtotal = store.cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const delivery = 4500;
    const total = subtotal + delivery;

    document.getElementById('cart-subtotal').innerText = formatMoney(subtotal);
    document.getElementById('cart-delivery-fee').innerText = formatMoney(delivery);
    document.getElementById('cart-grand-total').innerText = formatMoney(total);
  }

  renderCheckout() {
    const subtotal = store.cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const total = subtotal + 4500;
    document.getElementById('checkout-final-total').innerText = formatMoney(total);
  }

  renderTracking() {
    const order = store.orders.find(o => o.id === store.activeTrackingOrderId) || store.orders[0];
    if (!order) return;

    document.getElementById('track-order-code').innerText = '#' + order.id;
    document.getElementById('track-pin-code').innerText = order.pin;
    document.getElementById('track-address-text').innerText = order.address;

    const states = [
      { key: ORDER_STATES.TOMADO, title: '1. Pedido Tomado', desc: 'Registrado en el sistema', icon: '📝' },
      { key: ORDER_STATES.ACEPTADO, title: '2. Aceptado', desc: 'Confirmado por cocina', icon: '👨‍🍳' },
      { key: ORDER_STATES.PREPARACION, title: '3. En el Horno', desc: 'Cocción a la leña', icon: '🔥' },
      { key: ORDER_STATES.DESPACHADO, title: '4. Despachado', desc: 'Repartidor en camino', icon: '🛵' },
      { key: ORDER_STATES.ENTREGADO, title: '5. Entregado', desc: '¡Buen provecho!', icon: '🎉' }
    ];

    const currentIdx = states.findIndex(s => s.key === order.state);
    const stepperEl = document.getElementById('tracking-stepper-container');

    stepperEl.innerHTML = states.map((s, idx) => {
      let cls = '';
      if (idx < currentIdx) cls = 'completed active';
      else if (idx === currentIdx) cls = 'active current';

      return `
        <div class="stepper-row ${cls}">
          <div class="stepper-bullet">${idx < currentIdx ? '✓' : s.icon}</div>
          <div>
            <div style="font-weight:700; color:#fff; font-size:0.83rem;">${s.title}</div>
            <div style="font-size:0.7rem; color:var(--text-dim);">${s.desc}</div>
          </div>
        </div>
      `;
    }).join('');

    // Show or hide live map based on status
    const mapEl = document.getElementById('tracking-live-map');
    const driverEl = document.getElementById('tracking-driver-card');
    const driver = DRIVERS.find(d => d.id === order.driverId) || DRIVERS[0];

    if (order.state === ORDER_STATES.DESPACHADO) {
      mapEl.style.display = 'flex';
      driverEl.style.display = 'flex';
      document.getElementById('track-driver-name').innerText = driver.name;
      document.getElementById('track-driver-vehicle').innerText = driver.vehicle;
      document.getElementById('track-eta-banner').innerText = '🛵 Repartidor en camino: Llega en ~10 min';
    } else if (order.state === ORDER_STATES.ENTREGADO) {
      mapEl.style.display = 'none';
      driverEl.style.display = 'none';
      document.getElementById('track-eta-banner').innerText = '🎉 ¡Pedido entregado con éxito!';
    } else {
      mapEl.style.display = 'none';
      driverEl.style.display = 'none';
      document.getElementById('track-eta-banner').innerText = '🔥 Preparando en cocina: ~25 min';
    }
  }
}

const mobileNav = new MobileNavigator();

window.removeItemFromCart = function(index) {
  store.cart.splice(index, 1);
  mobileNav.renderCart();
  mobileNav.updateBottomNav('cart');
};

// =============================================================================
// 4. B2B KANBAN OPERATIONS RENDERER
// =============================================================================
function formatMoney(amount) {
  return '$' + (amount || 0).toLocaleString('es-CO');
}

function renderB2BKanban(state) {
  // KPI update
  const totalRev = state.orders.reduce((s, o) => s + o.total, 0);
  const activeCount = state.orders.filter(o => o.state !== ORDER_STATES.ENTREGADO).length;
  const inRouteCount = state.orders.filter(o => o.state === ORDER_STATES.DESPACHADO).length;

  document.getElementById('kpi-rev').innerText = formatMoney(totalRev);
  document.getElementById('kpi-act').innerText = activeCount;
  document.getElementById('kpi-route').innerText = `${inRouteCount} / ${DRIVERS.length}`;

  const colContainers = {
    [ORDER_STATES.TOMADO]: document.getElementById('deck-tomado'),
    [ORDER_STATES.ACEPTADO]: document.getElementById('deck-aceptado'),
    [ORDER_STATES.PREPARACION]: document.getElementById('deck-prep'),
    [ORDER_STATES.DESPACHADO]: document.getElementById('deck-despachado'),
    [ORDER_STATES.ENTREGADO]: document.getElementById('deck-entregado')
  };

  Object.values(colContainers).forEach(c => { if (c) c.innerHTML = ''; });

  let filtered = state.orders;
  if (state.b2bFilter !== 'ALL') {
    filtered = filtered.filter(o => o.channel === state.b2bFilter);
  }

  // Update counter badges
  document.getElementById('badge-tomado').innerText = filtered.filter(o => o.state === ORDER_STATES.TOMADO).length;
  document.getElementById('badge-aceptado').innerText = filtered.filter(o => o.state === ORDER_STATES.ACEPTADO).length;
  document.getElementById('badge-prep').innerText = filtered.filter(o => o.state === ORDER_STATES.PREPARACION).length;
  document.getElementById('badge-despachado').innerText = filtered.filter(o => o.state === ORDER_STATES.DESPACHADO).length;
  document.getElementById('badge-entregado').innerText = filtered.filter(o => o.state === ORDER_STATES.ENTREGADO).length;

  filtered.forEach(order => {
    const col = colContainers[order.state];
    if (!col) return;

    const card = document.createElement('div');
    card.className = 'k-card';

    let actionBtn = '';
    if (order.state === ORDER_STATES.TOMADO) {
      actionBtn = `<button class="k-btn-advance" onclick="store.advanceOrder('${order.id}')">✓ Aceptar Pedido</button>`;
    } else if (order.state === ORDER_STATES.ACEPTADO) {
      actionBtn = `<button class="k-btn-advance" onclick="store.advanceOrder('${order.id}')">👨‍🍳 Pasar a Cocina</button>`;
    } else if (order.state === ORDER_STATES.PREPARACION) {
      actionBtn = `<button class="k-btn-advance" onclick="store.advanceOrder('${order.id}')">🛵 Despachar Domicilio</button>`;
    } else if (order.state === ORDER_STATES.DESPACHADO) {
      actionBtn = `<button class="k-btn-advance" onclick="store.advanceOrder('${order.id}')">✅ Confirmar Entrega</button>`;
    } else {
      actionBtn = `<div style="font-size:0.72rem; color:var(--success-green); text-align:center; padding-top:4px;">✓ Finalizado</div>`;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-weight:800; color:#fff; font-size:0.92rem;">${order.id}</span>
        <span style="font-size:0.68rem; background:rgba(234,88,12,0.2); color:var(--pizza-orange-light); padding:2px 6px; border-radius:4px; font-weight:700;">
          ${order.channel}
        </span>
      </div>

      <div style="font-size:0.8rem; color:#f1f5f9; font-weight:600;">${order.customer}</div>
      <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:6px;">📍 ${order.address}</div>

      <div style="background:rgba(0,0,0,0.25); border-radius:6px; padding:6px; font-size:0.75rem; margin-bottom:6px;">
        ${order.items.map(i => `<div>${i.name}</div>`).join('')}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px;">
        <span style="font-weight:800; color:var(--success-green);">${formatMoney(order.total)}</span>
        <button style="background:none; border:none; color:var(--info-blue); font-size:0.7rem; cursor:pointer;" onclick="inspectOrderInMobile('${order.id}')">
          📲 Ver en App
        </button>
      </div>

      ${actionBtn}
    `;

    col.appendChild(card);
  });
}

window.inspectOrderInMobile = function(orderId) {
  store.activeTrackingOrderId = orderId;
  store.notify();
  // Switch to mobile tab and go to tracking screen
  document.getElementById('main-tab-mobile').click();
  mobileNav.goTo('tracking');
};

// =============================================================================
// 5. GLOBAL INITIALIZATION & BINDINGS
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Main Top Nav Tabs Switcher
  const mainTabs = document.querySelectorAll('.tab-btn');
  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mainTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-view');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // Flow Controller Pills (Quick Jump for Client Presentation)
  document.querySelectorAll('.flow-step-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const target = pill.getAttribute('data-target');
      mobileNav.goTo(target);
    });
  });

  // Bottom Nav Bar Clicks
  document.getElementById('bnav-home')?.addEventListener('click', () => mobileNav.goTo('catalog'));
  document.getElementById('bnav-cart')?.addEventListener('click', () => mobileNav.goTo('cart'));
  document.getElementById('bnav-orders')?.addEventListener('click', () => mobileNav.goTo('tracking'));

  // Customizer Size Pills
  document.querySelectorAll('#cust-sizes .select-pill-card').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#cust-sizes .select-pill-card').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      mobileNav.selectedSize = pill.getAttribute('data-size');
      mobileNav.updateCustomizerPrice();
    });
  });

  // Customizer Crust Pills
  document.querySelectorAll('#cust-crusts .select-pill-card').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#cust-crusts .select-pill-card').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      mobileNav.selectedCrust = pill.getAttribute('data-crust');
      mobileNav.updateCustomizerPrice();
    });
  });

  // Customizer Topping Checkboxes
  document.querySelectorAll('.topping-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const val = chk.value;
      if (chk.checked) {
        if (!mobileNav.selectedToppings.includes(val)) mobileNav.selectedToppings.push(val);
      } else {
        mobileNav.selectedToppings = mobileNav.selectedToppings.filter(t => t !== val);
      }
      mobileNav.updateCustomizerPrice();
    });
  });

  // Checkout Payment Method Selection
  document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // Submit Order Button in Checkout Screen
  document.getElementById('btn-confirm-checkout')?.addEventListener('click', () => {
    const newOrder = store.createOrderFromCart({
      name: 'David Santana',
      phone: '+57 312 990 8821',
      address: 'Calle 93 #14-20, Apto 501'
    });

    document.getElementById('success-order-code').innerText = '#' + newOrder.id;
    mobileNav.goTo('success');
  });

  // Demo Order Button in Top Nav
  document.getElementById('btn-top-demo')?.addEventListener('click', () => {
    const demoNames = ['Mariana Restrepo', 'Felipe Castro', 'Alejandra Ruiz'];
    const demoAddrs = ['Cra 7 #71-52', 'Calle 100 #19A-20', 'Transversal 23 #97-10'];
    const rName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const rAddr = demoAddrs[Math.floor(Math.random() * demoAddrs.length)];

    store.orders.unshift({
      id: 'PZ-' + Math.floor(1000 + Math.random() * 9000),
      customer: rName,
      phone: '+57 311 000 9988',
      address: rAddr,
      channel: 'APP',
      state: ORDER_STATES.TOMADO,
      items: [{ name: 'Pepperoni Suprema (Mediana)', customs: 'Borde de Queso', price: 33400 }],
      total: 33400,
      createdAt: new Date(),
      driverId: null,
      pin: '4491'
    });

    audio.play('new_order');
    store.notify();
  });

  // Store Subscribe
  store.subscribe(state => {
    renderB2BKanban(state);
    if (mobileNav.currentScreen === 'tracking') {
      mobileNav.renderTracking();
    }
  });

  // Render Catalog Screen Items
  const catGrid = document.getElementById('catalog-products-list');
  if (catGrid) {
    catGrid.innerHTML = PIZZA_CATALOG.map(p => `
      <div class="product-item-card" onclick="mobileNav.startCustomizing('${p.id}')">
        <div class="product-img-box">${p.emoji}</div>
        <div class="product-details">
          <div>
            <div class="product-name">${p.name}</div>
            <div class="product-ingredients">${p.desc}</div>
          </div>
          <div class="product-bottom-row">
            <span class="product-price-tag">${formatMoney(p.basePrice)}</span>
            <button class="btn-open-custom">+ Personalizar</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Initial Boot
  renderB2BKanban(store);
  mobileNav.init();
});
