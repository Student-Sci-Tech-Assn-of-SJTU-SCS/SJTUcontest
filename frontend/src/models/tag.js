export default class TagClass {
  constructor(name, description, category) {
    this.name = name; // 和后端交互的名称
    this.description = description; // 前端展示的名称
    this.category = category; // 类别
  }

  toString() {
    return this.description;
  }

  equals(other) {
    return (
      other instanceof TagClass &&
      this.name === other.name &&
      this.description === other.description &&
      this.category === other.category
    );
  }
}