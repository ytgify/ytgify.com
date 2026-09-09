import ToolPage, { toolMetadata } from '../gif-tools/ToolPage';
export const metadata = toolMetadata('resize-gif');
export default function Page() {
  return <ToolPage tool="resize-gif" />;
}
