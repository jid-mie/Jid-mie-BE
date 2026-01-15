# Sử dụng Node.js image nhẹ
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --production

# Copy toàn bộ source code
COPY . .

# Expose port (Google Cloud Run thường dùng biến môi trường PORT, mặc định 8080)
ENV PORT=8080
EXPOSE 8080

# Chạy ứng dụng
CMD ["npm", "start"]
