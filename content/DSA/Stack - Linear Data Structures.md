---
title: "Stack Data structure"
description: "A Stack implementation"
date: "2024-02-20"
category: "Algorithms"
image: "/images/algorithms.png"

---

#### Stack Implementation Using Array

```c
#include <iostream>
using namespace std;

#define MAX 1000 // Define the maximum size of the stack

class Stack {
    int top;

public:
    int arr[MAX]; // Maximum size of Stack

    Stack() { top = -1; }

    bool push(int x);
    int pop();
    int peek();
    bool isEmpty();
};

bool Stack::push(int x) {
    if (top >= (MAX - 1)) {
        cout << "Stack Overflow" << endl;
        return false;
    }
    else {
        arr[++top] = x;
        cout << x << " pushed into stack" << endl;
        return true;
    }
}

int Stack::pop() {
    if (top < 0) {
        cout << "Stack Underflow" << endl;
        return 0;
    }
    else {
        int x = arr[top--];
        return x;
    }
}

int Stack::peek() {
    if (top < 0) {
        cout << "Stack is Empty" << endl;
        return 0;
    }
    else {
        int x = arr[top];
        return x;
    }
}

bool Stack::isEmpty() {
    return (top < 0);
}

int main() {
    Stack s;
    s.push(10);
    s.push(20);
    s.push(30);
    cout << s.pop() << " popped from stack" << endl;
    cout << "Top element is " << s.peek() << endl;
    cout << "Stack is empty: " << (s.isEmpty() ? "True" : "False") << endl;

    return 0;
}

```

### Stack Implementation using Linked list

```c
#include <iostream>
using namespace std;

class StackNode {
public:
    int data;
    StackNode* next;
};

class Stack {
    StackNode* top;

public:
    Stack() { top = nullptr; }

    void push(int x);
    int pop();
    int peek();
    bool isEmpty();
};

void Stack::push(int x) {
    StackNode* newNode = new StackNode();
    newNode->data = x;
    newNode->next = top;
    top = newNode;
    cout << x << " pushed into stack" << endl;
}

int Stack::pop() {
    if (top == nullptr) {
        cout << "Stack Underflow" << endl;
        return 0;
    }
    else {
        int popped = top->data;
        StackNode* temp = top;
        top = top->next;
        delete temp;
        return popped;
    }
}

int Stack::peek() {
    if (top == nullptr) {
        cout << "Stack is Empty" << endl;
        return 0;
    }
    else {
        return top->data;
    }
}

bool Stack::isEmpty() {
    return top == nullptr;
}

int main() {
    Stack s;
    s.push(10);
    s.push(20);
    s.push(30);
    cout << s.pop() << " popped from stack" << endl;
    cout << "Top element is " << s.peek() << endl;
    cout << "Stack is empty: " << (s.isEmpty() ? "True" : "False") << endl;

    return 0;
}

```

#### Solution to applications on stack : Bracket Balancing
```c


bool isMatchingPair(char character1, char character2) {
    if (character1 == '(' && character2 == ')')
        return true;
    else if (character1 == '{' && character2 == '}')
        return true;
    else if (character1 == '[' && character2 == ']')
        return true;
    else
        return false;
}

bool areBracketsBalanced(string expr) {
    stack<char> s;
    for (int i = 0; i < expr.length(); i++) {
        if (expr[i] == '(' || expr[i] == '{' || expr[i] == '[') {
            s.push(expr[i]);
        }

        if (expr[i] == ')' || expr[i] == '}' || expr[i] == ']') {
            if (s.empty()) {
                return false;
            }
            else if (!isMatchingPair(s.top(), expr[i])) {
                return false;
            }
            else {
                s.pop();
            }
        }
    }

    return s.empty();
}

```


#### Solution to applications on stack: Postfix to Infix

```c
int precedence(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;
}

string InfixToPostfix(const string &infix) {
    stack<char> s;
    string postfix;
    for (auto i : infix) {
        if (isdigit(i)) {
            postfix += i;
        } else if (i == '(') {
            s.push(i);
        } else if (i == ')') {
            while (!s.empty() && s.top() != '(') {
                postfix += s.top();
                s.pop();
            }
            s.pop(); 
        } else {
            // Operator 
            while (!s.empty() && precedence(s.top()) >= precedence(i)) {
                postfix += s.top();
                s.pop();
            }
            s.push(i);
        }
    }
    // remaining operators inthe stack
    while (!s.empty()) {
        postfix += s.top();
        s.pop();
    }
    return postfix;
}
```
