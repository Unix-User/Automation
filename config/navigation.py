from dataclasses import dataclass
from typing import List, Optional

@dataclass
class NavItem:
    name: str  # Nome exibido no menu
    url: str   # URL ou anchor link
    icon: Optional[str] = None  # Ícone Bootstrap (opcional)
    children: List['NavItem'] = None  # Subitens para dropdown (opcional)
    order: int = 999  # Ordem de exibição
    requires_auth: bool = False  # Se requer autenticação
    highlight: bool = False  # Se deve ser destacado (ex: botão)

# Configuração da navegação
NAV_ITEMS = [
    NavItem(
        name="Home",
        url="/",
        icon="bi-house",
        order=1
    ),
    NavItem(
        name="Recursos",
        url="#features",
        icon="bi-gear",
        order=2
    ),
    NavItem(
        name="Benefícios",
        url="#benefits",
        icon="bi-graph-up",
        order=3
    ),
    NavItem(
        name="FAQ",
        url="#faq",
        icon="bi-question-circle",
        order=4
    ),
    NavItem(
        name="Começar Chat",
        url="/chat",
        icon="bi-chat",
        highlight=True,
        order=5
    ),
]

def get_nav_items(authenticated: bool = False) -> List[NavItem]:
    """Retorna itens de navegação filtrados por autenticação"""
    items = NAV_ITEMS.copy()
    if not authenticated:
        items = [item for item in items if not item.requires_auth]
    return sorted(items, key=lambda x: x.order) 