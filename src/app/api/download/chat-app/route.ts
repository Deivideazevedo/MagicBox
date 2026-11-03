import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GOOGLE_DRIVE_FOLDER_ID = "1Kk62LK6Dx8ErwlcRd17CdB2Gg3s5sjEZ";
const FALLBACK_FILE = {
  filename: "app-release-v3.0.apk",
  id: "1bKuLi7fA0dcUJbP8p7Os9bmGNLMe6Gu4",
};

// Cache simples em memória com TTL de 5 minutos
let cachedFile: { filename: string; id: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

function parseVersion(filename: string): number[] {
  const match = filename.match(/v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/i);
  if (!match) return [0, 0, 0];
  return [
    parseInt(match[1] || "0", 10),
    parseInt(match[2] || "0", 10),
    parseInt(match[3] || "0", 10),
  ];
}

function compareVersions(a: { filename: string }, b: { filename: string }): number {
  const vA = parseVersion(a.filename);
  const vB = parseVersion(b.filename);
  for (let i = 0; i < 3; i++) {
    if (vA[i] !== vB[i]) {
      return vB[i] - vA[i]; // Ordem decrescente (maior versão primeiro)
    }
  }
  return b.filename.localeCompare(a.filename);
}

async function fetchLatestDriveFile(): Promise<{ filename: string; id: string }> {
  const now = Date.now();
  if (cachedFile && now - cachedFile.timestamp < CACHE_TTL_MS) {
    return { filename: cachedFile.filename, id: cachedFile.id };
  }

  try {
    const folderUrl = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(folderUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Google Drive respondeu com status ${response.status}`);
    }

    const html = await response.text();

    // Regex para identificar arquivos executáveis/instaladores no payload javascript do Drive
    const regex =
      /(?:\\x22|")([^"\\\/,]+\.(?:apk|zip|rar|tar\.gz))\\x22[\s\S]{1,4000}?drive\.google\.com\\\/file\\\/d\\\/([a-zA-Z0-9_-]+)/g;

    let match: RegExpExecArray | null;
    const foundFiles: Array<{ filename: string; id: string }> = [];

    while ((match = regex.exec(html)) !== null) {
      foundFiles.push({ filename: match[1], id: match[2] });
    }

    if (foundFiles.length > 0) {
      foundFiles.sort(compareVersions);
      const latest = foundFiles[0];

      cachedFile = {
        filename: latest.filename,
        id: latest.id,
        timestamp: now,
      };

      return latest;
    }
  } catch (err) {
    console.warn("Aviso ao buscar versão mais recente do Google Drive, usando fallback:", err);
  }

  // Fallback seguro caso haja timeout ou formato inesperado
  return cachedFile
    ? { filename: cachedFile.filename, id: cachedFile.id }
    : FALLBACK_FILE;
}

export async function GET(request: NextRequest) {
  const latestFile = await fetchLatestDriveFile();
  const searchParams = request.nextUrl.searchParams;

  // Permite inspecionar informações do arquivo caso chamado com ?json=true
  if (searchParams.get("json") === "true") {
    return NextResponse.json({
      success: true,
      file: latestFile,
      downloadUrl: `https://drive.usercontent.google.com/download?id=${latestFile.id}&export=download&confirm=t`,
    });
  }

  // Redireciona diretamente para o download do arquivo no Google Drive
  const downloadUrl = `https://drive.usercontent.google.com/download?id=${latestFile.id}&export=download&confirm=t`;
  return NextResponse.redirect(downloadUrl, 307);
}
