---
title: "Queue Data structure"
description: "A Queue algorithm implementation"
date: "2024-02-20"
category: "Algorithms"
image: "/images/algorithms.png"

---

Implementation for queue using a linked list 

```c
#include <iostream>
using namespace std;

class Node {
public:
    int data;
    Node* next;
};

class Queue {
    Node* front;
    Node* rear;

public:
    Queue() {
        front = rear = nullptr;
    }

    void push(int x);
    int pop();
    bool isEmpty();
    int peek();
};

void Queue::push(int x) {
    Node* newNode = new Node();
    newNode->data = x;
    newNode->next = nullptr;

    if (rear == nullptr) {
        front = rear = newNode;
        return;
    }

    rear->next = newNode;
    rear = newNode;
    cout << x << " pushed to queue" << endl;
}

int Queue::pop() {
    if (front == nullptr) {
        cout << "Queue Underflow" << endl;
        return -1;
    }

    Node* temp = front;
    front = front->next;

    if (front == nullptr) {
        rear = nullptr;
    }

    int popped = temp->data;
    delete temp;
    return popped;
}

bool Queue::isEmpty() {
    return front == nullptr;
}

int Queue::peek() {
    if (front == nullptr) {
        cout << "Queue is Empty" << endl;
        return -1;
    }
    return front->data;
}

int main() {
    Queue q;
    q.push(10);
    q.push(20);
    q.push(30);
    cout << q.pop() << " popped from queue" << endl;
    cout << "Front element is " << q.peek() << endl;
    cout << "Queue is empty: " << (q.isEmpty() ? "True" : "False") << endl;

    return 0;
}

```

### Queue Implementation using Array

```c
#include <iostream>
using namespace std;

#define MAX 1000 // Define the maximum size of the queue

class Queue {
    int front, rear, size;
    int arr[MAX];

public:
    Queue() {
        front = size = 0;
        rear = MAX - 1;
    }

    bool push(int x);
    int pop();
    bool isEmpty();
    int peek();
};

bool Queue::push(int x) {
    if (size == MAX) {
        cout << "Queue Overflow" << endl;
        return false;
    }

    rear = (rear + 1) % MAX;
    arr[rear] = x;
    size = size + 1;
    cout << x << " pushed to queue" << endl;
    return true;
}

int Queue::pop() {
    if (isEmpty()) {
        cout << "Queue Underflow" << endl;
        return -1;
    }

    int item = arr[front];
    front = (front + 1) % MAX;
    size = size - 1;
    return item;
}

bool Queue::isEmpty() {
    return (size == 0);
}

int Queue::peek() {
    if (isEmpty()) {
        cout << "Queue is Empty" << endl;
        return -1;
    }
    return arr[front];
}

int main() {
    Queue q;
    q.push(10);
    q.push(20);
    q.push(30);
    cout << q.pop() << " popped from queue" << endl;
    cout << "Front element is " << q.peek() << endl;
    cout << "Queue is empty: " << (q.isEmpty() ? "True" : "False") << endl;

    return 0;
}
```
