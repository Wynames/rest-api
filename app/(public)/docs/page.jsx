// app/(public)/docs/page.jsx
import ApiCard from '@/components/ApiCard';

export default function DocsPage() {
  // Dummy data beberapa API (sesuai blueprint)
  const apis = [
    {
      method: 'GET',
      endpoint: '/api/fun/waifu',
      description: 'Mendapatkan karakter Waifu atau Husbu acak berdasarkan gender.',
      params: [
        {
          name: 'gender',
          type: 'string',
          description: 'Pilih "cowo" atau "cewe"',
          required: true,
          example: 'cowo',
        },
      ],
      exampleCode: `fetch('/api/fun/waifu?gender=cowo&apikey=YOUR_KEY')
  .then(res => res.json())
  .then(data => console.log(data))`,
      responseJson: `{
  "success": true,
  "data": {
    "name": "Mikasa Ackerman",
    "anime": "Attack on Titan",
    "image": "https://example.com/mikasa.jpg"
  }
}`,
    },
    {
      method: 'GET',
      endpoint: '/api/downloader/tiktok',
      description: 'Mengunduh video TikTok tanpa watermark.',
      params: [
        {
          name: 'url',
          type: 'string',
          description: 'URL video TikTok yang valid',
          required: true,
          example: 'https://vt.tiktok.com/xxxx',
        },
      ],
      exampleCode: `fetch('/api/downloader/tiktok?url=...&apikey=YOUR_KEY')
  .then(res => res.json())
  .then(data => console.log(data.video_url))`,
      responseJson: `{
  "success": true,
  "video_url": "https://example.com/video.mp4",
  "title": "Video Lucu"
}`,
    },
    {
      method: 'GET',
      endpoint: '/api/ai/chat',
      description: 'Chat dengan model AI sederhana.',
      params: [
        {
          name: 'prompt',
          type: 'string',
          description: 'Teks pertanyaan atau perintah',
          required: true,
          example: 'Halo',
        },
        {
          name: 'model',
          type: 'string',
          description: 'Model AI (opsional, default: gpt-3.5)',
          required: false,
          example: 'gpt-4',
        },
      ],
      exampleCode: `fetch('/api/ai/chat?prompt=Halo&apikey=YOUR_KEY')
  .then(res => res.json())
  .then(data => console.log(data.reply))`,
      responseJson: `{
  "success": true,
  "reply": "Halo! Saya AI asisten XT4.",
  "model": "gpt-3.5-turbo"
}`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-pure-white mb-2">Dokumentasi API</h1>
      <p className="text-text-secondary mb-8">
        Berikut daftar endpoint yang tersedia. Klik pada card untuk melihat detail, parameter, dan contoh penggunaan.
      </p>

      {/* Render semua endpoint dengan ApiCard */}
      {apis.map((api, idx) => (
        <ApiCard
          key={idx}
          method={api.method}
          endpoint={api.endpoint}
          description={api.description}
          params={api.params}
          exampleCode={api.exampleCode}
          responseJson={api.responseJson}
        />
      ))}
    </div>
  );
}
