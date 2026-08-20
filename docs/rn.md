| ID | Regra | Restrição a ser aplicada |
| :--- | :--- | :--- |
| **RN01** | Estoque Mínimo | Um produto ou variação (ex: Legging M) não pode ser adicionado ao carrinho se o seu estoque disponível for igual a zero. |
| **RN02** | Baixa de Estoque | A quantidade do produto só deve ser subtraída permanentemente do banco de dados após a confirmação do pagamento. |
| **RN03** | Restrição de Acesso | Apenas usuários autenticados com o perfil "admin" podem acessar as rotas de criação e edição de produtos na API. |
| **RN04** | Integridade de Preços | O preço do item no pedido deve ser gravado no momento da compra. Alterações futuras no valor base do produto não podem alterar o histórico de pedidos antigos. |
| **RN05** | Autopreenchimento | Ao digitar um CEP válido no momento do checkout, os campos de endereço devem ser preenchidos automaticamente, exigindo do usuário apenas o complemento e número. |
