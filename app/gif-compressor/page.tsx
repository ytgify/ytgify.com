import ToolPage, { toolMetadata } from '../gif-tools/ToolPage';
export const metadata = toolMetadata('gif-compressor');
export default function Page() {
  return <ToolPage tool="gif-compressor" />;
}
