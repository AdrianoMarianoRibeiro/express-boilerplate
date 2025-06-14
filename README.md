# Express API with NestJS Structure + TSyringe

Esta é uma API Express.js estruturada como NestJS, utilizando TSyringe para injeção de dependências, com arquitetura completa de camadas.

## 🏗️ Arquitetura

### Camadas da Aplicação
```
Controller → Service → Repository → Entity
     ↓         ↓         ↓         ↓
   HTTP     Business   Data      Database
  Layer     Logic     Access     Layer
```

### Componentes

- **Controllers**: Gerenciam requisições HTTP e respostas
- **Services**: Contêm a lógica de negócio
- **Repositories**: Abstraem o acesso a dados
- **Entities**: Representam as tabelas do banco
- **DTOs**: Data Transfer Objects para validação
- **Mappers**: Convertem entre entities e DTOs
- **Modules**: Organizam e agrupam funcionalidades

## 🚀 Características

- ✅ **TSyringe** para injeção de dependências
- ✅ **Decorators** customizados (@Controller, @Get, @Post, etc.)
- ✅ **Repository Pattern** com interfaces
- ✅ **Mappers** para conversão de dados
- ✅ **DTOs** com validação
- ✅ **TypeORM** para persistência
- ✅ **Paginação** automática
- ✅ **Respostas padronizadas**
- ✅ **Tratamento de erros** robusto

## 📁 Estrutura do Projeto

```
src/
├── config/              # Configurações
├── controllers/         # Controllers HTTP
├── core/               # Core da aplicação
├── decorators/         # Decorators customizados
├── dto/                # Data Transfer Objects
│   ├── common/         # DTOs comuns
│   └── user/           # DTOs específicos do usuário
├── entities/           # Entidades TypeORM
├── mappers/            # Mapeadores de dados
├── modules/            # Módulos da aplicação
├── repositories/       # Repositórios
│   └── interfaces/     # Interfaces dos repositórios
├── services/           # Serviços de negócio
└── main.ts            # Bootstrap da aplicação
```

## 🛠️ Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm run start:prod
```

## 📋 Rotas da API

### Aplicação
- `GET /` - Informações da API
- `GET /health` - Health check

### Usuários
- `GET /users` - Listar usuários (com paginação opcional)
- `GET /users?page=1&limit=10` - Listar com paginação
- `GET /users/:id` - Buscar usuário por ID
- `POST /users` - Criar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

## 🔧 Exemplo de Uso

### Criar um novo módulo

```typescript
// product.entity.ts
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column('decimal')
  price: number;
}

// product.repository.ts
@injectable()
export class ProductRepository implements IProductRepository {
  constructor(@inject(DataSource) private dataSource: DataSource) {
    this.repository = dataSource.getRepository(Product);
  }
  // ... implementação
}

// product.service.ts
@injectable()
export class ProductService {
  constructor(
    @inject(ProductRepository) private productRepository: IProductRepository,
    private productMapper: ProductMapper
  ) {}
  // ... lógica de negócio
}

// product.controller.ts
@Controller('/products')
@injectable()
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAll() {
    return this.productService.findAll();
  }
}

// product.module.ts
@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductMapper]
})
export class ProductModule {}
```

## 📊 Exemplos de Resposta

### Sucesso
```json
{
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "User retrieved successfully",
  "success": true,
  "timestamp": "2023-01-01T00"
}
```
