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
    name: 'Pizza 8 Sabores 50cm',
    desc: 'La reina de Popayán: 8 especialidades artesanales en una sola pizza gigante de 50 cm al horno de leña.',
    basePrice: 80000,
    badge: '8S',
    image: 'assets/pizza_completa_todos_sabores_badge.webp',
    sizes: { porcion: 10000, mediana: 45000, familiar: 80000 }
  },
  {
    id: 'p2',
    name: 'Payanesa Especial',
    desc: 'Trozos de tocineta crujiente, maíz tierno dulce, salsa de la casa y mozzarella fundido al horno.',
    basePrice: 45000,
    badge: 'PY',
    image: 'assets/pizza_completa_todos_sabores_badge.webp',
    sizes: { porcion: 10000, mediana: 45000, familiar: 80000 }
  },
  {
    id: 'p3',
    name: 'Maduritos & Queso',
    desc: 'Plátano maduro caramelizado, queso campesino y mozzarella artesanal con reducción balsámica.',
    basePrice: 45000,
    badge: 'MD',
    image: 'assets/pizza_completa_todos_sabores_badge.webp',
    sizes: { porcion: 10000, mediana: 45000, familiar: 80000 }
  },
  {
    id: 'p4',
    name: 'Pollo & Champiñones',
    desc: 'Pechuga marinada al horno de leña, champiñones salteados frescos y finas hierbas de la huerta.',
    basePrice: 45000,
    badge: 'PC',
    image: 'assets/pizza_completa_todos_sabores_badge.webp',
    sizes: { porcion: 10000, mediana: 45000, familiar: 80000 }
  }
];

const DRIVERS = [
  { id: 'd1', name: 'Carlos Mendoza', vehicle: 'Moto Reparto #02 (Sede Torres del Río)', phone: '+57 312 458 9012' },
  { id: 'd2', name: 'Andrea Gómez', vehicle: 'Moto Reparto #05 (Sede TerraPlaza)', phone: '+57 300 789 4433' },
  { id: 'd3', name: 'Mario Rossi', vehicle: 'Moto Reparto #07 (Sede El Uvo)', phone: '+57 315 221 8899' }
];

class PizzaStore {
  constructor() {
    this.orders = [
      {
        id: 'PZ-7821',
        customer: 'Santiago Botero',
        phone: '+57 310 998 1234',
        address: 'Carrera 9 # 18N-45, Torres del Río',
        channel: 'APP',
        state: ORDER_STATES.TOMADO,
        items: [{ name: 'Pizza 8 Sabores 50cm', customs: 'Borde de Queso + Champiñones', price: 85000 }],
        total: 89500,
        createdAt: new Date(Date.now() - 4 * 60000),
        driverId: null,
        pin: '5812'
      },
      {
        id: 'PZ-7820',
        customer: 'Valeria Restrepo',
        phone: '+57 316 443 8901',
        address: 'Calle 4 # 7-50, Centro Histórico',
        channel: 'WEB',
        state: ORDER_STATES.ACEPTADO,
        items: [{ name: 'Payanesa Especial (Mediana)', customs: 'Masa Artesanal Delgada', price: 45000 }],
        total: 49500,
        createdAt: new Date(Date.now() - 11 * 60000),
        driverId: null,
        pin: '2390'
      },
      {
        id: 'PZ-7819',
        customer: 'Andrés Morales',
        phone: '+57 315 776 2200',
        address: 'Calle 15N # 6-30, Santa Clara',
        channel: 'APP',
        state: ORDER_STATES.PREPARACION,
        items: [{ name: 'Maduritos & Queso (Mediana)', customs: 'Extra Mozzarella', price: 49000 }],
        total: 53500,
        createdAt: new Date(Date.now() - 18 * 60000),
        driverId: 'd1',
        pin: '9041'
      },
      {
        id: 'PZ-7818',
        customer: 'Camila Díaz',
        phone: '+57 301 223 5589',
        address: 'Carrera 6 # 65N-20, Ciudad Jardín',
        channel: 'APP',
        state: ORDER_STATES.DESPACHADO,
        items: [{ name: 'Pollo & Champiñones (Familiar 50cm)', customs: 'Tocineta crispy', price: 84000 }],
        total: 88500,
        createdAt: new Date(Date.now() - 28 * 60000),
        driverId: 'd2',
        pin: '1182'
      },
      {
        id: 'PZ-7815',
        customer: 'Cliente Mostrador Sede',
        phone: 'N/A',
        address: 'Consumo Local - Sede Torres del Río',
        channel: 'POS',
        state: ORDER_STATES.ENTREGADO,
        items: [{ name: 'Porción Pizza 8 Sabores', customs: 'Consumo Inmediato', price: 10000 }],
        total: 10000,
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
      address: customerData.address || 'Carrera 9 # 18N-45, Torres del Río, Popayán',
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
    this.selectedSize = 'familiar';
    this.selectedCrust = 'artesanal';
    this.selectedToppings = [];
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
    this.selectedSize = 'familiar';
    this.selectedCrust = 'artesanal';
    this.selectedToppings = [];
    this.goTo('customizer');
  }

  renderCustomizer() {
    const pizza = this.customizingPizza;
    document.getElementById('custom-pizza-title').innerText = pizza.name;
    document.getElementById('custom-pizza-desc').innerText = pizza.desc;
    const imgEl = document.getElementById('custom-pizza-img');
    if (imgEl && pizza.image) imgEl.src = pizza.image;
    this.updateCustomizerPrice();
  }

  updateCustomizerPrice() {
    const pizza = this.customizingPizza;
    let price = pizza.sizes[this.selectedSize] || pizza.basePrice;
    if (this.selectedCrust === 'queso') price += 5000;
    price += (this.selectedToppings.length * 4000);

    document.getElementById('custom-calc-price').innerText = formatMoney(price);
    return price;
  }

  addToCartFromCustomizer() {
    const finalPrice = this.updateCustomizerPrice();
    store.cart.push({
      pizzaId: this.customizingPizza.id,
      name: this.customizingPizza.name,
      size: this.selectedSize.toUpperCase(),
      crust: this.selectedCrust === 'queso' ? 'Borde de Queso (+5k)' : 'Masa Artesanal Delgada',
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
          <div style="font-size:1.1rem; font-weight:800; color:var(--pizza-orange-light); margin-bottom:0.5rem;">CARRITO VACIO</div>
          <p>Aún no has agregado pizzas a tu orden</p>
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
      { key: ORDER_STATES.TOMADO, title: '1. Pedido Tomado', desc: 'Registrado en el sistema', icon: '1' },
      { key: ORDER_STATES.ACEPTADO, title: '2. Aceptado', desc: 'Confirmado por cocina Popayán', icon: '2' },
      { key: ORDER_STATES.PREPARACION, title: '3. En el Horno', desc: 'Cocción artesanal a la leña', icon: '3' },
      { key: ORDER_STATES.DESPACHADO, title: '4. Despachado', desc: 'Repartidor en camino por Popayán', icon: '4' },
      { key: ORDER_STATES.ENTREGADO, title: '5. Entregado', desc: 'Pedido recibido con éxito', icon: '5' }
    ];

    const currentIdx = states.findIndex(s => s.key === order.state);
    const stepperEl = document.getElementById('tracking-stepper-container');

    stepperEl.innerHTML = states.map((s, idx) => {
      let cls = '';
      if (idx < currentIdx) cls = 'completed active';
      else if (idx === currentIdx) cls = 'active current';

      return `
        <div class="stepper-row ${cls}">
          <div class="stepper-bullet" style="font-weight:800; font-size:0.75rem;">${idx < currentIdx ? 'OK' : s.icon}</div>
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
      document.getElementById('track-eta-banner').innerText = 'Repartidor en camino: Llega en ~10 min (Popayán)';
    } else if (order.state === ORDER_STATES.ENTREGADO) {
      mapEl.style.display = 'none';
      driverEl.style.display = 'none';
      document.getElementById('track-eta-banner').innerText = 'Pedido entregado con éxito en Popayán';
    } else {
      mapEl.style.display = 'none';
      driverEl.style.display = 'none';
      document.getElementById('track-eta-banner').innerText = 'Preparando en horno de leña: ~25 min';
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
      actionBtn = `<button class="k-btn-advance" onclick="store.advanceOrder('${order.id}')">Aceptar Pedido</button>`;
    } else if (order.state === ORDER_STATES.ACEPTADO) {
      actionBtn = `<button class="k-btn-advance" onclick="store.advanceOrder('${order.id}')">Pasar a Cocina</button>`;
    } else if (order.state === ORDER_STATES.PREPARACION) {
      actionBtn = `<button class="k-btn-advance" onclick="store.advanceOrder('${order.id}')">Despachar Domicilio</button>`;
    } else if (order.state === ORDER_STATES.DESPACHADO) {
      actionBtn = `<button class="k-btn-advance" onclick="store.advanceOrder('${order.id}')">Confirmar Entrega</button>`;
    } else {
      actionBtn = `<div style="font-size:0.72rem; color:var(--success-green); text-align:center; padding-top:4px; font-weight:700;">Finalizado</div>`;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-weight:800; color:#fff; font-size:0.92rem;">${order.id}</span>
        <span style="font-size:0.68rem; background:rgba(234,88,12,0.2); color:var(--pizza-orange-light); padding:2px 6px; border-radius:4px; font-weight:700;">
          ${order.channel}
        </span>
      </div>

      <div style="font-size:0.8rem; color:#f1f5f9; font-weight:600;">${order.customer}</div>
      <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:6px;">${order.address}</div>

      <div style="background:rgba(0,0,0,0.25); border-radius:6px; padding:6px; font-size:0.75rem; margin-bottom:6px;">
        ${order.items.map(i => `<div>${i.name}</div>`).join('')}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px;">
        <span style="font-weight:800; color:var(--success-green);">${formatMoney(order.total)}</span>
        <button style="background:none; border:none; color:var(--info-blue); font-size:0.7rem; font-weight:700; cursor:pointer;" onclick="inspectOrderInMobile('${order.id}')">
          Ver en App
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
// POS (Point of Sale) LOGIC & BINDINGS
// =============================================================================
let posTicket = [
  { name: 'Porción 8 Sabores', price: 10000, qty: 2 },
  { name: 'Gaseosa Postobón 400ml', price: 5000, qty: 1 }
];

function renderPOSTicket() {
  const container = document.getElementById('pos-ticket-items');
  if (!container) return;

  if (posTicket.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.8rem;">Ticket vacío. Selecciona productos a la izquierda.</div>';
    document.getElementById('pos-subtotal').innerText = '$0';
    document.getElementById('pos-iva').innerText = '$0';
    document.getElementById('pos-total').innerText = '$0';
    return;
  }

  container.innerHTML = posTicket.map((item, idx) => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed rgba(255,255,255,0.08); font-size:0.82rem;">
      <div>
        <div style="font-weight:700; color:#fff;">${item.name}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${item.qty} x ${formatMoney(item.price)}</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:800; color:#fff;">${formatMoney(item.price * item.qty)}</span>
        <button style="background:none; border:none; color:var(--brand-red); cursor:pointer; font-weight:800; font-size:0.9rem;" onclick="removePOSItem(${idx})">&times;</button>
      </div>
    </div>
  `).join('');

  const subtotal = posTicket.reduce((s, i) => s + (i.price * i.qty), 0);
  const impoconsumo = Math.round(subtotal * 0.08);
  const total = subtotal + impoconsumo;

  document.getElementById('pos-subtotal').innerText = formatMoney(subtotal);
  document.getElementById('pos-iva').innerText = formatMoney(impoconsumo);
  document.getElementById('pos-total').innerText = formatMoney(total);
}

window.addPOSItem = function(name, price) {
  audio.play('click');
  const existing = posTicket.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    posTicket.push({ name, price, qty: 1 });
  }
  renderPOSTicket();
};

window.removePOSItem = function(idx) {
  posTicket.splice(idx, 1);
  renderPOSTicket();
};

window.checkoutPOS = function(method) {
  if (posTicket.length === 0) {
    alert('Agrega al menos un producto al ticket antes de cobrar.');
    return;
  }

  const subtotal = posTicket.reduce((s, i) => s + (i.price * i.qty), 0);
  const total = subtotal + Math.round(subtotal * 0.08);
  const posOrderId = 'POS-' + Math.floor(1000 + Math.random() * 9000);

  store.orders.unshift({
    id: posOrderId,
    customer: `Cliente Mostrador (${method})`,
    phone: 'Presencial',
    address: 'Sede Torres del Río - Mostrador',
    channel: 'POS',
    state: ORDER_STATES.TOMADO,
    items: posTicket.map(i => ({ name: `${i.name} (x${i.qty})`, customs: 'Consumo Local', price: i.price * i.qty })),
    total: total,
    createdAt: new Date(),
    driverId: null,
    pin: '0000'
  });

  audio.play('new_order');
  store.notify();
  posTicket = [];
  renderPOSTicket();
  alert(`Cobro de ${formatMoney(total)} registrado con éxito (${method}).\nOrden ${posOrderId} transmitida al Kanban de cocina.`);
};

function renderPOSCatalog() {
  const container = document.getElementById('pos-catalog-grid');
  if (!container) return;

  const quickItems = [
    { name: 'Porción 8 Sabores', price: 10000, cat: 'Porción' },
    { name: 'Pizza Mediana 8 Sabores', price: 45000, cat: 'Mediana' },
    { name: 'Pizza 8 Sabores 50cm', price: 80000, cat: 'Familiar' },
    { name: 'Porción Payanesa', price: 10000, cat: 'Porción' },
    { name: 'Mediana Payanesa', price: 45000, cat: 'Mediana' },
    { name: 'Porción Maduritos', price: 10000, cat: 'Porción' },
    { name: 'Gaseosa Postobón 400ml', price: 5000, cat: 'Bebida' },
    { name: 'Cerveza Club Colombia', price: 7000, cat: 'Bebida' }
  ];

  container.innerHTML = quickItems.map(item => `
    <div class="pos-item-card" onclick="addPOSItem('${item.name}', ${item.price})" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:0.85rem; cursor:pointer; text-align:center; transition:border 0.2s;">
      <span class="channel-tag pos" style="font-size:0.65rem; margin-bottom:4px; display:inline-block;">${item.cat}</span>
      <div style="font-weight:700; color:#fff; font-size:0.85rem; margin:4px 0;">${item.name}</div>
      <div style="font-weight:800; color:var(--pizza-orange-light); font-size:0.9rem;">${formatMoney(item.price)}</div>
    </div>
  `).join('');
}

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
      address: 'Carrera 9 # 18N-45, Torres del Río, Popayán'
    });

    document.getElementById('success-order-code').innerText = '#' + newOrder.id;
    mobileNav.goTo('success');
  });

  // Demo Order Button in Top Nav
  document.getElementById('btn-top-demo')?.addEventListener('click', () => {
    const demoNames = ['Mariana Restrepo', 'Felipe Castro', 'Alejandra Ruiz'];
    const demoAddrs = [
      'Calle 5 # 4-20, Centro Histórico',
      'Carrera 9 # 18N-45, Torres del Río',
      'Calle 15N # 6-30, Santa Clara'
    ];
    const rName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const rAddr = demoAddrs[Math.floor(Math.random() * demoAddrs.length)];

    store.orders.unshift({
      id: 'PZ-' + Math.floor(1000 + Math.random() * 9000),
      customer: rName,
      phone: '+57 311 000 9988',
      address: rAddr,
      channel: 'APP',
      state: ORDER_STATES.TOMADO,
      items: [{ name: 'Pizza 8 Sabores 50cm', customs: 'Borde de Queso', price: 85000 }],
      total: 89500,
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
        <div class="product-img-box" style="display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <img src="${p.image}" alt="${p.name}" style="width:48px; height:48px; object-fit:contain; border-radius:50%;">
        </div>
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

  // POS Initial Render
  renderPOSCatalog();
  renderPOSTicket();

  // Initial Boot
  renderB2BKanban(store);
  mobileNav.init();
});
