/**
 * 生成用于显示用户信息的二维码数据URL
 * 使用简单的 Canvas 实现
 */

interface UserQRData {
  id: string;
  uid: string;
  nickname: string;
  avatar: string;
  accountId?: string;
}

export class QRCodeGenerator {
  /**
   * 生成用户二维码数据 URL（简单的模拟实现）
   */
  static generateUserQR(userData: UserQRData): string {
    const data = JSON.stringify({
      type: 'transcend_user',
      id: userData.id,
      uid: userData.uid,
      nickname: userData.nickname,
      accountId: userData.accountId || userData.uid
    });

    return this.generateSimpleQR(data);
  }

  /**
   * 生成简单的二维码图案（使用 Canvas）
   */
  static generateSimpleQR(data: string): string {
    const canvas = document.createElement('canvas');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      // 如果无法获取 Canvas 上下文，返回一个默认的 SVG 占位符
      return this.generateFallbackSVG(data);
    }

    // 白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // 绘制边框
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    // 绘制模拟的二维码图案（简化版本）
    ctx.fillStyle = '#1f2937';

    // 绘制三个定位角
    const cornerSize = 40;
    this.drawPositionPattern(ctx, 15, 15, cornerSize);
    this.drawPositionPattern(ctx, size - 15 - cornerSize, 15, cornerSize);
    this.drawPositionPattern(ctx, 15, size - 15 - cornerSize, cornerSize);

    // 绘制随机的模块（使用数据的哈希值作为种子）
    const hash = this.simpleHash(data);
    const moduleSize = 8;
    const gridSize = Math.floor((size - 100) / moduleSize);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if ((hash * (i + 1) * (j + 1)) % 3 === 0) {
          const x = 50 + i * moduleSize;
          const y = 50 + j * moduleSize;
          ctx.fillRect(x, y, moduleSize - 1, moduleSize - 1);
        }
      }
    }

    // 在中央添加 Transcend 标志
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size / 2 - 20, size / 2 - 20, 40, 40);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.strokeRect(size / 2 - 20, size / 2 - 20, 40, 40);
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TC', size / 2, size / 2);

    return canvas.toDataURL('image/png');
  }

  /**
   * 绘制定位图案
   */
  static drawPositionPattern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    const innerSize = size * 0.6;
    const centerSize = size * 0.3;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + size * 0.2, y + size * 0.2, innerSize, innerSize);

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x + size * 0.35, y + size * 0.35, centerSize, centerSize);
  }

  /**
   * 简单的哈希函数
   */
  static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * 生成备用的 SVG 二维码
   */
  static generateFallbackSVG(data: string): string {
    const svgContent = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="15" y="15" width="40" height="40" fill="#1f2937"/>
        <rect x="23" y="23" width="24" height="24" fill="white"/>
        <rect x="27" y="27" width="16" height="16" fill="#1f2937"/>
        
        <rect x="145" y="15" width="40" height="40" fill="#1f2937"/>
        <rect x="153" y="23" width="24" height="24" fill="white"/>
        <rect x="157" y="27" width="16" height="16" fill="#1f2937"/>
        
        <rect x="15" y="145" width="40" height="40" fill="#1f2937"/>
        <rect x="23" y="153" width="24" height="24" fill="white"/>
        <rect x="27" y="157" width="16" height="16" fill="#1f2937"/>
        
        <rect x="80" y="80" width="40" height="40" fill="white" stroke="#6366f1" stroke-width="3"/>
        <text x="100" y="105" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="#6366f1">TC</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
  }

  /**
   * 下载二维码
   */
  static downloadQR(userData: UserQRData, filename: string = 'transcend-qr.png') {
    const dataUrl = this.generateUserQR(userData);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
}
