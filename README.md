# Nexes

Nexes is a powerful, infinite canvas workspace designed for creative thinking, planning, and productivity. It combines the flexibility of a whiteboard with structured tools like Kanban boards, Pomodoro timers, and rich widgets to help you organize your thoughts and projects seamlessly.

Built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**, Nexes offers a modern, high-performance experience with smooth animations and touch-optimized interactions.

## 🚀 Key Features

### 🎨 Infinite Canvas

- **Freeform Workspace**: Pan and zoom across an infinite canvas powered by React Flow.
- **Touch Optimized**: Smooth interactions on touch devices, including pinch-to-zoom and two-finger panning.
- **Drawing Tools**: Integrated pen and drawing tools for easier sketching and annotation.

### 🧩 Smart Widgets & Nodes

Nexes comes with a variety of specialized nodes to suit different workflows:

- **📝 Sticky Notes**: Quick thoughts and memos.
- **🖼️ Polaroid Nodes**: Display images with captions in a retro style.
- **⏱️ Pomodoro Timer**: Built-in focus timer to keep you productive.
- **📋 Kanban Boards**: Full-featured task management directly on the canvas.
- **🎵 Ambience Node**: Set the mood with background ambience.
- **🔲 Shapes & Frames**: Organize content with rectangles, frames, and custom shapes.
- **✍️ Text & Drawings**: Rich text editing and freehand drawing capabilities.

### ⚡ Technical Highlights

- **Modern Stack**: Built on the bleeding edge with Next.js 16 App Router and React 19.
- **State Management**: Uses **Zustand** for efficient, scalable state handling.
- **Styling**: Styled with **Tailwind CSS 4** and **Framer Motion** for beautiful transitions.
- **Performance**: Optimized for large boards with many elements.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Canvas Engine**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nexes.git
   ```
2. Navigate to the project directory:
   ```bash
   cd nexes
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using Nexes.

## 📂 Project Structure

- **/app**: Next.js App Router pages and layouts.
- **/components**: Reusable UI components.
  - **/canvas**: Canvas-specific components (InfiniteCanvas, Tools).
  - **/widgets**: Individual node components (StickyNote, Polaroid, etc.).
  - **/home**: Dashboard and landing page components.
  - **/ui**: Generic UI elements (buttons, inputs, etc.).
- **/lib**: Utility functions and helpers.
- **/store**: Zustand stores for state management.
- **/public**: Static assets.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
