# Deep Learning Model Architectures & Explainability

## Evaluated Models
1. **Custom CNN Baseline (3.2M params):** 5 Conv2D stages with BatchNorm, Spatial Dropout, and Dense head.
2. **MobileNetV3-Large (5.4M params):** Inverted residual blocks with Squeeze-and-Excitation, hard-swish non-linearities.
3. **EfficientNetV2-B0 (7.1M params):** Fused-MBConv and progressive learning, optimized for parameter efficiency and high sensitivity on underrepresented lesion types. Currently active model.
4. **DenseNet121 (8.0M params):** Dense feature aggregation mitigating vanishing gradients.
5. **ConvNeXt-Tiny (28.6M params):** Modernized pure-convolutional network with 7x7 depthwise kernels.

## Explainable AI: Grad-CAM
Grad-CAM computes the gradient of score $y^c$ for lesion class $c$ with respect to feature activation maps $A^k$ of the final convolutional layer:

$$\alpha_k^c = \frac{1}{Z} \sum_i \sum_j \frac{\partial y^c}{\partial A_{i,j}^k}$$

$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$

The resulting activation is bilinearly upsampled to $224 \times 224$ and rendered as a Jet heatmap and alpha-blended overlay alongside the original image.
