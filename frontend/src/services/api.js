const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const PATHS = {
    users: '/users',
    products: '/products',
    variants: '/variants',
    favorites: '/favorites',
    orders: '/orders',
    cart: '/cart',
    admin: '/admin',
};

const TOKEN_KEY = 'larose_token';
const USER_KEY = 'larose_user';
const CART_KEY = 'larose_cart';
const MAX_QUANTITY = 99;

// sessão
export const session = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    getUser() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY));
        } catch {
            return null;
        }
    },
    save(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};

// núcleo
export class ApiError extends Error {
    constructor(status, message, data) {
        super(message);
        this.status = status; // 0 = sem conexão, 401 = sessão expirada, 403 = sem permissão, 422 = dado inválido...
        this.data = data;
    }
}

async function request(path, { method = 'GET', body, query, auth = true } = {}) {
    const headers = {};
    // FormData (envio de arquivo): o navegador define o Content-Type sozinho, com o "boundary"
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

    const token = session.getToken();
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    const qs = query
        ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== '' && v !== null))
        : '';

    let res;
    try {
        res = await fetch(`${BASE_URL}${path}${qs}`, {
            method,
            headers,
            body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(0, 'Não foi possível conectar ao servidor.');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        // Token vencido ou inválido: limpa a sessão e avisa o app (ouça "auth:expired" para ir ao login)
        if (res.status === 401 && token) {
            session.clear();
            window.dispatchEvent(new Event('auth:expired'));
        }
        throw new ApiError(res.status, data.message || 'Erro inesperado.', data);
    }

    return data;
}

export const imageUrl = (path) => (!path ? null : /^https?:\/\//.test(path) ? path : `${BASE_URL}${path}`);

// autenticação
export const auth = {
    async login(email, password) {
        const data = await request(`${PATHS.users}/login`, { method: 'POST', body: { email, password }, auth: false });
        session.save(data.token, data.user);
        return data.user; // { id, name, email, isAdmin }
    },
    register: (name, email, password) =>
        request(`${PATHS.users}/register`, { method: 'POST', body: { name, email, password }, auth: false }),
    logout: () => session.clear(),
    isLoggedIn: () => Boolean(session.getToken()),
    isAdmin: () => Boolean(session.getUser() && session.getUser().isAdmin), // só para esconder menus; a API é quem barra
    forgotPassword: (email) =>
        request(`${PATHS.users}/forgot-password`, { method: 'POST', body: { email }, auth: false }),
    resetPassword: (token, newPassword) =>
        request(`${PATHS.users}/reset-password/${token}`, { method: 'POST', body: { newPassword }, auth: false }),
    // Usuário logado troca a própria senha (rota nova: veja userController.changePassword.js)
    changePassword: (currentPassword, newPassword) =>
        request(`${PATHS.users}/change-password`, { method: 'PATCH', body: { currentPassword, newPassword } }),
};

// catálogo (público)
export const products = {
    list: () => request(PATHS.products, { auth: false }),            // { products: [...] }
    get: (id) => request(`${PATHS.products}/${id}`, { auth: false }), // { product }
};

// carrinho
const readCart = () => {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
};
const writeCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    return items;
};

export const cart = {
    items: readCart, // [{ variantId, quantity }]
    add(variantId, quantity = 1) {
        const items = readCart();
        const found = items.find((i) => i.variantId === variantId);
        if (found) found.quantity = Math.min(MAX_QUANTITY, found.quantity + quantity);
        else items.push({ variantId, quantity: Math.min(MAX_QUANTITY, quantity) });
        return writeCart(items);
    },
    setQuantity(variantId, quantity) {
        const items = readCart()
            .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QUANTITY, quantity) } : i))
            .filter((i) => i.quantity > 0);
        return writeCart(items);
    },
    remove: (variantId) => writeCart(readCart().filter((i) => i.variantId !== variantId)),
    clear: () => writeCart([]),
    quote() {
        const items = readCart();
        if (items.length === 0) return Promise.resolve({ items: [], subtotal: 0, canCheckout: false });
        return request(`${PATHS.cart}/quote`, { method: 'POST', body: { items }, auth: false });
    },
};

// pedido (exige login)
export const orders = {
    // Cria o pedido com o carrinho atual e esvazia o carrinho.
    async checkout() {
        const data = await request(PATHS.orders, { method: 'POST', body: { items: readCart() } });
        writeCart([]);
        return data;
    },
};

// favoritos (exige login)
export const favorites = {
    list: () => request(PATHS.favorites), // { favorites: [{ favoriteId, product: { id, name, price, imageUrl, category, colors } }] }
    toggle: (productId) => request(PATHS.favorites, { method: 'POST', body: { ProductId: productId } }), // { favorited: true|false }
};

//painel admin (exige token de admin)
export const admin = {
    // Dashboard (Visão Geral)
    dashboard: () => request(`${PATHS.admin}/dashboard`),

    // Vendas e Pedidos
    orders: ({ search, status } = {}) => request(`${PATHS.admin}/orders`, { query: { search, status } }),
    confirmPayment: (orderId) => request(`${PATHS.admin}/orders/${orderId}/confirm-payment`, { method: 'PATCH' }),
    setOrderStatus: (orderId, status) =>
        request(`${PATHS.admin}/orders/${orderId}/status`, { method: 'PATCH', body: { status } }),

    // Estoque
    stock: (search) => request(`${PATHS.admin}/stock`, { query: { search } }),
    setStock: (variantId, stock) =>
        request(`${PATHS.admin}/variants/${variantId}/stock`, { method: 'PATCH', body: { stock } }),

    // Produtos e variações ("Novo Produto", editar e excluir)
    createProduct: (data) => request(PATHS.products, { method: 'POST', body: data }),
    updateProduct: (id, data) => request(`${PATHS.products}/${id}`, { method: 'PUT', body: data }),
    deleteProduct: (id) => request(`${PATHS.products}/${id}`, { method: 'DELETE' }),
    createVariant: (data) => request(PATHS.variants, { method: 'POST', body: data }), // { sku, size, color, stock, ProductId }
    updateVariant: (id, data) => request(`${PATHS.variants}/${id}`, { method: 'PUT', body: data }),
    deleteVariant: (id) => request(`${PATHS.variants}/${id}`, { method: 'DELETE' }),

    // Envia uma imagem (JPG, PNG ou WebP, até 3 MB)
    uploadImage(file) {
        const form = new FormData();
        form.append('image', file);
        return request(`${PATHS.admin}/upload-image`, { method: 'POST', body: form });
    },
};
