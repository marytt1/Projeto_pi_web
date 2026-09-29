import Header from './components/Header';
import Main from "./components/Main";
import Footer from './components/Footer';
//import CatalogPage from './components/CatalogPage';
//import CartPage from './components/CartPage';
//import ProductDetailPage from './components/ProductDetailPage';
//import AdminDashboard from './components/AdminDashboard';

// App é o componente principal da aplicação responsável pela visualização das páginas
export default function App() {
  return (

    /* Para visualizar as demais telas é só substituir pelo outro componente, por exemplo:
    <CatalogPage />, <CartPage />,
    <ProductDetailPage /> ou <AdminDashboard />*/ 

    <div className = "font-sans text-[#3a3a3a]">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

