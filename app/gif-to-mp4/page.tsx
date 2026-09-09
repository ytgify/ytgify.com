import ToolPage, { toolMetadata } from '../gif-tools/ToolPage';
export const metadata = toolMetadata('gif-to-mp4');
export default function Page() {
  return <ToolPage tool="gif-to-mp4" />;
}
