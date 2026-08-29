import { Progress } from '@/components/ui/progress'

export default function ProgressLabelExample() {
  return <div class="grid w-full max-w-sm gap-2"><label for="upload-progress" class="flex justify-between"><span>Upload progress</span><span>66%</span></label><Progress id="upload-progress" value={66} max={100} /></div>
}
