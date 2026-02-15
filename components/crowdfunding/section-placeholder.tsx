export function SectionPlaceholder({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      {/* Section Header - Editable */}
      <div className="border-b border-border pb-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-2">Edit this description in Design Mode</p>
      </div>
      
      {/* Main Content Canvas - Editable */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content Area (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Block 1 */}
          <div className="min-h-64 p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <h3 className="text-xl font-semibold mb-4">Content Block 1</h3>
            <p className="text-muted-foreground">Add your content here. This block is fully editable in Design Mode.</p>
          </div>
          
          {/* Content Block 2 */}
          <div className="min-h-64 p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <h3 className="text-xl font-semibold mb-4">Content Block 2</h3>
            <p className="text-muted-foreground">Add more content here. This block is fully editable in Design Mode.</p>
          </div>
        </div>
        
        {/* Right Sidebar (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sidebar Block 1 */}
          <div className="p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <h4 className="text-lg font-semibold mb-4">Sidebar Block 1</h4>
            <p className="text-muted-foreground text-sm">Editable sidebar content</p>
          </div>
          
          {/* Sidebar Block 2 */}
          <div className="p-6 bg-muted/30 rounded-lg border border-dashed border-border">
            <h4 className="text-lg font-semibold mb-4">Sidebar Block 2</h4>
            <p className="text-muted-foreground text-sm">Editable sidebar content</p>
          </div>
          
          {/* Image Placeholder */}
          <div className="aspect-video bg-muted/50 rounded-lg border border-dashed border-border flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Image Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  )
}
