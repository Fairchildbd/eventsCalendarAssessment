import { sizedImage } from '@/utils/image';

describe('sizedImage', () => {
  it.each([
    ['https://images.example.test/photo?w=900&q=70', 400, 'https://images.example.test/photo?w=400&q=70'],
    ['https://images.example.test/photo?w=900&q=70', 399.6, 'https://images.example.test/photo?w=400&q=70'],
    ['https://images.example.test/photo.jpg', 400, 'https://images.example.test/photo.jpg'],
  ])('resizes %s to width %s', (uri, width, expected) => {
    expect(sizedImage(uri, width)).toBe(expected);
  });
});
