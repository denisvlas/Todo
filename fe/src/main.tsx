import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { cacheExchange, createClient, fetchExchange, Provider } from "urql";
import { StoreProvider } from "./mst/StoreContext";
import "bootstrap-icons/font/bootstrap-icons.css";

export const client = createClient({
  url: "http://localhost:8080/v1/graphql",
  fetchOptions: {
    headers: {
      "x-hasura-admin-secret": "admin",
    },
  },
  exchanges: [cacheExchange, fetchExchange],
});
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Provider value={client}>
    <StoreProvider>
      <App />
    </StoreProvider>
  </Provider>
);
