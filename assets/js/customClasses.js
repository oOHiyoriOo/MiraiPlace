class FixedSizeList {
    constructor(size) {
        this.size = size;
        this.list = [];
    }

    append(element) {
        this.list.push(element);

        if (this.list.length > this.size) {
            this.list.shift(); // Remove the oldest element
        }
    }
}