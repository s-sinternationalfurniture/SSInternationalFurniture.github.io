import { useState } from 'react'
import './App.css'

const whatsappNumber = '919999999999'
const fallbackImage = '/images/modern-sofa.svg'

const initialCategories = [
  {
    id: 'modern',
    name: 'Modern Furniture',
    description: 'Contemporary pieces with clean lines and smart functionality.',
    image: '/images/modern-sofa.svg',
    groups: [
      {
        id: 'living-room',
        name: 'Living Room',
        products: [
          {
            id: 'curve-sofa',
            name: 'Curve Sofa',
            images: ['/images/modern-sofa.svg'],
          },
          {
            id: 'nest-chair',
            name: 'Nest Lounge Chair',
            images: ['/images/lounge-chair.svg'],
          },
        ],
      },
      {
        id: 'bedroom',
        name: 'Bedroom',
        products: [
          {
            id: 'halo-bed',
            name: 'Halo Bed Frame',
            images: ['/images/bed-frame.svg'],
          },
        ],
      },
    ],
  },
  {
    id: 'teak',
    name: 'Teak Wood Furniture',
    description: 'Premium teak pieces crafted for durability and timeless style.',
    image: '/images/teak-table.svg',
    groups: [
      {
        id: 'dining',
        name: 'Dining Tables',
        products: [
          {
            id: 'teak-table',
            name: 'River Teak Dining Table',
            images: ['/images/teak-table.svg'],
          },
        ],
      },
      {
        id: 'storage',
        name: 'Storage Units',
        products: [
          {
            id: 'teak-cabinet',
            name: 'Harbor Sideboard',
            images: ['/images/sideboard.svg'],
          },
        ],
      },
    ],
  },
]

function buildWhatsAppLink(productName) {
  const message = encodeURIComponent(`Hello! I would like to ask the price for ${productName}.`)
  return `https://wa.me/${whatsappNumber}?text=${message}`
}

function App() {
  const [categories, setCategories] = useState(initialCategories)
  const [activeCategory, setActiveCategory] = useState(initialCategories[0].id)
  const [categoryDrafts, setCategoryDrafts] = useState({})
  const [productDrafts, setProductDrafts] = useState({})
  const [categoryImages, setCategoryImages] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminCode, setAdminCode] = useState('')

  const selectedCategory = categories.find((item) => item.id === activeCategory) || categories[0]

  const handleCategoryDraft = (parentId, value) => {
    setCategoryDrafts((prev) => ({ ...prev, [parentId]: value }))
  }

  const handleCategoryImageUpload = async (parentId, event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        }),
    )

    const imageResults = await Promise.all(readers)
    setCategoryImages((prev) => ({ ...prev, [parentId]: imageResults }))
  }

  const addCategory = (parentId) => {
    const name = (categoryDrafts[parentId] || '').trim()
    if (!name) return

    setCategories((prev) =>
      prev.map((parent) =>
        parent.id === parentId
          ? {
              ...parent,
              groups: [
                ...parent.groups,
                {
                  id: `${parentId}-${Date.now()}`,
                  name,
                  image: categoryImages[parentId]?.[0] || fallbackImage,
                  products: [],
                },
              ],
            }
          : parent,
      ),
    )

    setCategoryDrafts((prev) => ({ ...prev, [parentId]: '' }))
    setCategoryImages((prev) => ({ ...prev, [parentId]: [] }))
  }

  const removeCategory = (parentId, groupId) => {
    setCategories((prev) =>
      prev.map((parent) =>
        parent.id === parentId
          ? {
              ...parent,
              groups: parent.groups.filter((group) => group.id !== groupId),
            }
          : parent,
      ),
    )
  }

  const handleProductDraft = (groupId, field, value) => {
    setProductDrafts((prev) => ({
      ...prev,
      [groupId]: { ...(prev[groupId] || {}), [field]: value },
    }))
  }

  const handleImageUpload = async (groupId, event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(file)
        }),
    )

    const imageResults = await Promise.all(readers)

    setProductDrafts((prev) => ({
      ...prev,
      [groupId]: {
        ...(prev[groupId] || {}),
        images: imageResults,
      },
    }))
  }

  const addProduct = (parentId, groupId) => {
    const draft = productDrafts[groupId] || {}
    const name = (draft.name || '').trim()
    const images = (draft.images || [])

    if (!name) return

    setCategories((prev) =>
      prev.map((parent) =>
        parent.id === parentId
          ? {
              ...parent,
              groups: parent.groups.map((group) =>
                group.id === groupId
                  ? {
                      ...group,
                      products: [
                        ...group.products,
                        {
                          id: `${groupId}-${Date.now()}`,
                          name,
                          images: images.length ? images : [fallbackImage],
                        },
                      ],
                    }
                  : group,
              ),
            }
          : parent,
      ),
    )

    setProductDrafts((prev) => ({ ...prev, [groupId]: { name: '', images: [] } }))
  }

  const removeProduct = (parentId, groupId, productId) => {
    if (!isAdmin) return

    setCategories((prev) =>
      prev.map((parent) =>
        parent.id === parentId
          ? {
              ...parent,
              groups: parent.groups.map((group) =>
                group.id === groupId
                  ? {
                      ...group,
                      products: group.products.filter((product) => product.id !== productId),
                    }
                  : group,
              ),
            }
          : parent,
      ),
    )
  }

  const handleAdminAccess = () => {
    if (adminCode === 'admin123') {
      setIsAdmin(true)
      setAdminCode('')
    }
  }

  return (
    <div className="app-shell">
      <header className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">SS International Furniture</p>
          <h1>Modern and teak collections, presented with a premium showroom experience.</h1>
          <p className="hero-text">
            Browse curated furniture categories, manage collections easily, and let customers ask for pricing through WhatsApp Business.
          </p>
        </div>
        <div className="hero-card" aria-label="Furniture business overview">
          <div className="hero-badge">Business Ready</div>
          <h2>Grow your showroom catalog with ease.</h2>
          <p>Use the tabs below to switch between modern furniture and teak wood collections.</p>
        </div>
      </header>

      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label="Furniture categories">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`tab-btn ${activeCategory === item.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        {!isAdmin ? (
          <div className="admin-panel">
            <input
              type="password"
              placeholder="Admin access"
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value)}
            />
            <button type="button" onClick={handleAdminAccess}>
              Enter
            </button>
          </div>
        ) : (
          <div className="admin-status">Admin mode enabled</div>
        )}
      </div>

      <main className="catalog-board">
        <section className="category-panel">
          <div className="category-panel-header">
            <div>
              <p className="eyebrow">{selectedCategory.name}</p>
              <h2>{selectedCategory.name}</h2>
              <p className="panel-description">{selectedCategory.description}</p>
            </div>
            {isAdmin ? (
              <div className="category-form">
                <input
                  type="text"
                  placeholder={selectedCategory.id === 'modern' ? 'Add a modern furniture category' : 'Add a teak product line'}
                  value={categoryDrafts[selectedCategory.id] || ''}
                  onChange={(event) => handleCategoryDraft(selectedCategory.id, event.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleCategoryImageUpload(selectedCategory.id, event)}
                />
                <button type="button" onClick={() => addCategory(selectedCategory.id)}>
                  Add Category
                </button>
              </div>
            ) : null}
          </div>

          <div className="group-list">
            {selectedCategory.groups.map((group) => (
              <article key={group.id} className="group-card">
                <div className="group-card-media">
                  <img
                    src={group.image || fallbackImage}
                    alt={`${group.name} preview`}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage
                    }}
                  />
                </div>

                <div className="group-card-header">
                  <h3>{group.name}</h3>
                  {isAdmin ? (
                    <button type="button" className="ghost-btn" onClick={() => removeCategory(selectedCategory.id, group.id)}>
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="product-list">
                  {group.products.map((product) => (
                    <div key={product.id} className="product-card">
                      <div className="product-image-gallery">
                        {(product.images || [fallbackImage]).map((image, index) => (
                          <img
                            key={`${product.id}-${index}`}
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            onError={(event) => {
                              event.currentTarget.src = fallbackImage
                            }}
                          />
                        ))}
                      </div>
                      <div className="product-content">
                        <strong>{product.name}</strong>
                        <a
                          className="ask-price-btn"
                          href={buildWhatsAppLink(product.name)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ask Price
                        </a>
                      </div>
                      {isAdmin ? (
                        <button
                          type="button"
                          className="ghost-btn remove-product"
                          onClick={() => removeProduct(selectedCategory.id, group.id, product.id)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {isAdmin ? (
                  <div className="product-form">
                    <input
                      type="text"
                      placeholder="Product name"
                      value={productDrafts[group.id]?.name || ''}
                      onChange={(event) => handleProductDraft(group.id, 'name', event.target.value)}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => handleImageUpload(group.id, event)}
                    />
                    <button type="button" onClick={() => addProduct(selectedCategory.id, group.id)}>
                      Add Product
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
