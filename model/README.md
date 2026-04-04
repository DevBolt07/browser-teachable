# /model Directory — ClaimLens AI

This folder stores the trained AI model files that are consumed by `customer-link.html`.

## Required Files

Place these 3 files here (exported from Admin Lab `index.html`):

| File | Description |
|---|---|
| `model.json` | Neural network architecture (topology) |
| `model.weights.bin` | Trained weight values |
| `metadata.json` | Class names list |

## How to generate these files

1. Open `index.html` (Admin Lab) in your browser
2. Collect training samples for each damage class
3. Click **"Train Model"** and wait for all 25 epochs
4. Click **"Export Model"** (💾 button)
5. Browser will download: `claimlens-model.json`, `claimlens-model.weights.bin`, `claimlens-metadata.json`
6. Rename them to: `model.json`, `model.weights.bin`, `metadata.json`
7. Move all 3 files into this `/model/` folder

## metadata.json Format

```json
{
  "classes": ["Clean Car", "Car Scratch", "Major Dent"],
  "version": "1.0"
}
```

> ⚠️ customer-link.html will show an error if these files are missing.
