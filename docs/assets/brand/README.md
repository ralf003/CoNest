# CoNest logo concept — Nest & Flight

设计方向：**共同构筑，让智能生长。**

CoNest 为不同 Agent 提供共同工作的基础。工具与组件可以组合，记忆可以接续，协作成果可以积累。标志用「承托的巢」与「准备展翼的小鸟」表达这层关系。

- **共筑**：巢由彼此交织的部分形成，代表组件与 Agent 的协作。
- **自主**：小鸟保有自己的轮廓与方向，代表参与者各自的能力。
- **生长**：向上的翼，代表共同基础上不断产生的新能力。

深海蓝用于巢，传达稳定与承托；珊瑚橙用于小鸟，增加生命力与亲近感。

英文品牌句：**A shared home. Room to grow.**

## Production assets

| 文件 | 用途 |
| --- | --- |
| `conest-logo.svg` | 512 × 512 viewBox、透明背景的彩色矢量母版 |
| `conest-logo-dark.svg` | 暗背景版本，浅色巢与珊瑚色小鸟 |
| `conest-logo-mono.svg` | 单色版本，使用 `currentColor`，默认黑色 |
| `conest-avatar.svg` | 方形头像，暖白背景，留有圆形裁切安全边距 |
| `conest-avatar.png` | 从 SVG 导出的 1024 × 1024 头像上传文件 |
| `conest-social-preview.svg` | 1280 × 640 仓库分享卡片矢量源文件 |
| `conest-social-preview.png` | 从 SVG 导出的 1280 × 640 GitHub 分享卡片上传文件 |

SVG 根据选定的小鸟与巢 PNG 手工重描，采用三次 Bézier 曲线、透明负形眼睛和实色填充。巢的交织间隙经过小尺寸调整。所有 SVG 均为真实路径，不嵌入 PNG，不依赖外部图像、字体文件或脚本。标志母版只含图形；首页横幅和分享卡片的文字使用系统字体栈。

首页使用 `../conest-banner.svg` 和 `../conest-banner-dark.svg`，均嵌入矢量标志路径。PNG 上传文件由 Chromium 按原生像素尺寸导出，后续修改应从 SVG 重新导出。

### GitHub image settings

个人仓库的所有者头像属于账号，修改后会影响该账号在 GitHub 上的其他位置。仓库单独的品牌图片可通过 **Settings → Social preview → Edit → Upload an image** 设置，使用 `conest-social-preview.png`。GitHub 推荐 1280 × 640、文件小于 1 MB；详见 [官方说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)。

账号头像上传时使用 `conest-avatar.png`。仅提交图片文件不会自动改变 GitHub 账号头像或 Social preview 设置。

## Original concept references

- `conest-nest-flight-concept.png` — imagegen 品牌提案，包含彩色、单色和小图标示意。
- `conest-nest-flight-mark.png` — imagegen 原始透明标志，供矢量重描参考。

## Generation record

Generated with the built-in imagegen tool, then copied into this repository. The user requested a hand-traced SVG of this bird-and-nest direction; the SVG files above supersede the generated raster for production use. The initial abstract feather/plant exploration was discarded.

Final presentation refinement prompt:

> Refine this CoNest bird-in-a-nest brand presentation. KEEP the recognizable shape of the bird emerging from the interwoven nest, the wordmark CoNest, the tagline 'A shared home. Room to grow.', and the three-view layout. CHANGE ONLY THE RENDERING: place the whole design on a SOLID FULLY OPAQUE very light warm cream background (#FAF8F4). NO TRANSPARENCY anywhere in the exported image. Every pixel must be opaque. Render all marks and type as pure SOLID flat colors with sharp crisp edges and full opacity. Main bird solid coral orange #EF7157, main nest and lettering solid dark navy #202C40, secondary app tile solid dark navy with the identical bird-and-nest mark solid cream. Remove ALL glow, bloom, shadows, semitransparency, gradients, black fog and fuzzy edges. The small symbol at lower right must be a crisp flat two-color bird/nest on cream, no glow. The result must be a clean legible vector-style identity board on opaque cream paper, NOT an atmospheric lighting rendering. Preserve form and composition closely. Ensure the entire wordmark and tagline are clearly readable. Landscape 1536 by 1024.

Standalone symbol prompt:

> Extract and faithfully reproduce ONLY the large bird-in-a-nest symbol from the left of the supplied CoNest brand board as a standalone production logo asset. Preserve its exact silhouette, wing angle, head facing right, tiny circular eye, and the interwoven rounded navy nest geometry. Do not redesign or simplify the mark. Remove all lettering, tagline, other logo copies, dark square, and paper background. Center the single logo on a square transparent canvas with about 12 percent empty margin. Use true transparency only OUTSIDE the logo and in the intentional cutout gaps. The interior of the coral bird and deep navy nest shapes must be FULLY OPAQUE solid flat colors, alpha 255. Coral #EF7157 and navy #202C40, no gradients, no texture, no glow, no shadows, no halos. Crisp clean vector-like edges. The eye and gaps should be transparent cutouts. No text, no board, no extras. Supply a high-resolution transparent PNG.

Prompts describe the intended treatment; the generated raster files are the actual deliverables.
