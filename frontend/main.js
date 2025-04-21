document.getElementById("scrapeBtn").addEventListener("click", async () => {
  const keyword = document.getElementById("keyword").value.trim();
  if (!keyword) {
    alert("Please enter a keyword");
    return;
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const response = await fetch(
      `http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`
    );
    const products = await response.json();

    if (!response.ok) {
      throw new Error(products.error || "Failed to fetch products");
    }

    if (products.length === 0) {
      resultsDiv.innerHTML =
        '<div class="error">No products found. Try a different keyword.</div>';
      return;
    }

    resultsDiv.innerHTML = products
      .map(
        (product) => `
      <div class="product">
        <img src="${
          product.imageUrl || "https://via.placeholder.com/150"
        }" alt="${product.title}" />
        <h3>${product.title}</h3>
        ${
          product.rating ? `<div class="rating">⭐ ${product.rating}</div>` : ""
        }
        ${
          product.reviews
            ? `<div class="reviews">${product.reviews} reviews</div>`
            : ""
        }
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error:", error);
    resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
});
