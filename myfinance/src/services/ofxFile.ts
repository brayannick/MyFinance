import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

/** Abre o app Arquivos do iOS e devolve o texto do arquivo escolhido (ou null se cancelar). */
export async function pickOfxFile(): Promise<{ name: string; content: string } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*', // o iOS nem sempre reconhece .ofx como tipo de arquivo
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  const content = new File(asset.uri).textSync();
  return { name: asset.name, content };
}