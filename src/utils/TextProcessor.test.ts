import { TextProcessor } from './TextProcessor';

describe('TextProcessor', () => {
  describe('extractUrl', () => {
    it('should extract valid https url', () => {
      expect(TextProcessor.extractUrl('check this https://example.com out')).toBe('https://example.com');
    });

    it('should extract valid http url', () => {
      expect(TextProcessor.extractUrl('check this http://example.com out')).toBe('http://example.com');
    });

    it('should return undefined if no url', () => {
      expect(TextProcessor.extractUrl('no url here')).toBeUndefined();
    });
  });

  describe('extractInstructions', () => {
    it('should return defaults if only url present', () => {
      expect(TextProcessor.extractInstructions('https://example.com')).toBe('Summarize this content:');
    });

    it('should extract text around url', () => {
      expect(TextProcessor.extractInstructions('please explain https://example.com in detail')).toBe('please explain in detail');
    });
  });

  describe('cleanHtml', () => {
    it('should remove scripts and styles', () => {
      const html = `
        <html>
          <head>
            <script>alert('hi')</script>
            <style>body { color: red; }</style>
          </head>
          <body>
            <h1>Title</h1>
            <p>Content</p>
          </body>
        </html>
      `;
      expect(TextProcessor.cleanHtml(html)).toBe('Title Content');
    });

    it('should handle unicode characters', () => {
        const html = '<body>Helly there 👋 🌍</body>';
        expect(TextProcessor.cleanHtml(html)).toBe('Helly there 👋 🌍');
    });

    it('should collapse multiple whitespaces', () => {
        const html = '<body>   Lots   of    spaces   </body>';
        expect(TextProcessor.cleanHtml(html)).toBe('Lots of spaces');
    });

    it('should handle empty body', () => {
        const html = '<html><head></head><body></body></html>';
        expect(TextProcessor.cleanHtml(html)).toBe('');
    });

    it('should handle missing body tag', () => {
        const html = '<div>Just some text</div>';
        expect(TextProcessor.cleanHtml(html)).toBe('Just some text');
    });
  });

  describe('truncate', () => {
      it('should not truncate if short enough', () => {
          expect(TextProcessor.truncate('short')).toBe('short');
      });

      it('should truncate and append suffix', () => {
          expect(TextProcessor.truncate('long text', 4)).toBe('long... [truncated]');
      });
  });
});
