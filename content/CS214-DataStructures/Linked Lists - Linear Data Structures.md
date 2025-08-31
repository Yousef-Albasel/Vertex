---
title: "Linked Lists "
description: "A Linked List implementation"
date: "2024-02-20"
category: "Algorithms"
image: "/images/algorithms.png"

---

```c
#include "SingleLinkedList.h"

#include <iostream>

using namespace std;

  

template <class Type>

SingleLinkedList<Type> :: SingleLinkedList()

{

    count = 0;

    first = NULL;

    last = NULL;

}

  

template <class Type>

SingleLinkedList<Type> :: ~SingleLinkedList()

{

    clear();

}

  

template <class Type>

void SingleLinkedList<Type> :: insertAtHead(Type element)

{

    nodeType <Type> *newNode = new nodeType<Type>;

    if (isEmpty()){

        newNode -> info = element;

        newNode -> link = NULL;

        first = newNode;

        last = newNode;

        count ++;

    }

    else{

        newNode -> info = element;

        newNode -> link = first;

        first = newNode;

        count ++;

    }

}

  

template <class Type>

void SingleLinkedList<Type> :: insertAtTail(Type element){

    nodeType <Type> *newNode = new nodeType<Type>;

    if (isEmpty()){

        newNode -> info = element;

        newNode -> link = NULL;

        first = newNode;

        last = newNode;

        count ++;

    }

    else {

        nodeType <Type> *current;

        nodeType <Type> *prev;

        current = first;

        prev = NULL;

        while (current != NULL){

            prev = current;

            current = current -> link;

        }

        prev -> link = newNode;

        newNode -> info = element;

        newNode -> link = NULL;

        last = newNode;

        count ++;

    }

}

  

template <class Type>

void SingleLinkedList<Type> :: insertAt(Type element, int index){

    nodeType <Type> *newNode = new nodeType<Type>;

    if (index > count){

        cout << "Error! Invalid index." << endl;

    }

    else if (index == 0){

        insertAtHead(element);

    }

    else if (index == count){

        insertAtTail(element);

    }

    else{

        int i = 0;

        nodeType<Type> *current = first;

        nodeType<Type> *prev = NULL;

        while (i < index){

            prev = current;

            current = current -> link;

            i++;

        }

        prev -> link = newNode;

        newNode -> info = element;

        newNode -> link = current;

        count ++;

    }

}

  

template <class Type>

void SingleLinkedList<Type>:: removeAtHead(){

    if (isEmpty()){

        cout << "Error! List is empty." << endl;

    }

    else{

        nodeType<Type> *temp;

        temp = first;

        first = first -> link;

        delete temp;

        count --;

    }

}

  

template <class Type>

void SingleLinkedList<Type>:: removeAtTail(){

    if (isEmpty()){

        cout << "Error! List is empty." << endl;

    }

    else{

        nodeType <Type> *current;

        nodeType <Type> *prev;

        current = first;

        prev = NULL;

        while (current -> link != NULL){

            prev = current;

            current = current -> link;

        }

        prev -> link = NULL;

        last = prev;

        delete current;

        count --;

    }

}

  

template <class Type>

void SingleLinkedList<Type>:: removeAt(int index){

    if (index  > count - 1){

        cout << "Error! Invalid index." << endl;

    }

    else if (index == count - 1){

        removeAtTail();

    }

    else if (index == 0){

        removeAtHead();

    }

    else{

        int i = 0;

        nodeType<Type> *current = first;

        nodeType<Type> *prev = NULL;

        while (i < index){

            prev = current;

            current = current -> link;

            i++;

        }

        prev -> link = current -> link;

        delete current;

        count --;

    }

}

  

template <class Type>

Type SingleLinkedList<Type> :: retrieveAt (int index) const{

    if (index > count - 1 || index < 0){

        cout << "Error! Invalid index.\n";

    }

    else{

        nodeType<Type> *current = first;

        int i = 0;

        while (i != index){

            current = current -> link;

            i ++;

        }

        return current -> info;

    }

}

  

template <class Type>

void SingleLinkedList<Type> :: replaceAt(Type newElement, int index){

    nodeType<Type> *current = first;

    if (index > count - 1 || index < 0){

        cout << "Error! Invalid index.\n";

    }

    else{

        int i = 0;

        while (current != NULL && i < index){

            current = current -> link;

            i ++;

        }

        current -> info = newElement;

    }

}

  

template <class Type>

bool SingleLinkedList<Type> :: isExist(Type element) const{

    nodeType <Type> *current = first;

    while (current != NULL){

        if (current -> info == element){

            return true;

        }

        current = current -> link;

    }

    return false;

}

  

template <class Type>

bool SingleLinkedList<Type> :: isItemAtEqual(Type element, int index){

    if (index > count - 1){

        cout << "Error! Invalid index.\n";

    }

    else{

        nodeType<Type> *current = first;

        int i = 0;

        while (current != NULL){

            if (i == index && current -> info == element){

                return true;

            }

            current = current -> link;

            i ++;

        }

        return false;

    }

}

  

template <class Type>

void SingleLinkedList<Type> :: swap(int firstItemIdx, int secondItemIdx){

    if (firstItemIdx > count - 1 || secondItemIdx > count - 1){

        cout << "Error! Invalid index.\n";

    }

    else{

        nodeType<Type> *F_idx, *S_idx;

        F_idx = first, S_idx = first;

        int i = 0;

        int j = 0;

        while (F_idx != NULL){

            if (i == firstItemIdx){

                break;

            }

            F_idx = F_idx -> link;

            i ++;

        }

        while (S_idx != NULL){

            if (j == secondItemIdx){

                break;

            }

            S_idx = S_idx -> link;

            j ++;

        }

        Type temp = F_idx -> info;

        F_idx -> info = S_idx -> info;

        S_idx -> info = temp;

    }

}

  

template <class Type>

bool SingleLinkedList<Type> :: isEmpty(){

    return (first == NULL);

}

  

template <class Type>

int SingleLinkedList<Type> :: linkedListSize(){

    return count;

}

  

template <class Type>

void SingleLinkedList<Type>:: clear() {

    nodeType<Type> *temp;

    while(first != NULL){

        temp = first;

        first = first -> link;

        delete temp;

    }

    last = NULL;

    count = 0;

}

  

template <class Type>

void SingleLinkedList<Type>:: print (){

    if (isEmpty()){

        cout << "Empty! Nothing to print." << endl;

    }

    else{

        nodeType<Type> *current = first;

        while (current != NULL){

            cout << current -> info << ' ';

            current = current -> link;

        }

        cout << '\n';

    }

}
```

##### Doubly Linked List

```c
#include "DoublyLinkedList.h"

  

template <typename ElementType>

DoublyLinkedList<ElementType>::DoublyLinkedList()

{

    count = 0;

    head = nullptr;

    tail = nullptr;

}

  

template <typename ElementType>

DoublyLinkedList<ElementType>::~DoublyLinkedList()

{

    clear();

}

  

template <typename ElementType>

bool DoublyLinkedList<ElementType>::isEmpty() const

{

    return (head == nullptr);

}

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::clear()

{

    Node<ElementType> *temp;

  

    while (head != nullptr)

    {

        temp = head;

        head = head->next;

        delete temp;

    }

    head = nullptr;

    tail = nullptr;

    count = 0;

}

  

template <typename ElementType>

int DoublyLinkedList<ElementType>::linkedListSize() const

{

    return count;

}

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::print() const

{

    Node<ElementType> *current = head;

    if (head == nullptr)

    {

        std::cout << "List is empty." << std::endl;

        return;

    }

    while (current->next != nullptr)

    {

        std::cout << current->info << " ";

        current = current->next;

    }

    std::cout << current->info;

    std::cout << std::endl;

}

  

template <typename ElementType>

bool DoublyLinkedList<ElementType>::isExist(const ElementType &element) const

{

    Node<ElementType> *current = head;

    bool isFound = false;

    while (!isFound && current != nullptr)

    {

        if (current->info >= element)

        {

            isFound = true;

        }

        else

        {

            current = current->next;

        }

    }

    if (isFound)

        isFound = (current->info == element);

    return isFound;

}

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::insertAtHead(const ElementType &element)

{

    Node<ElementType> *newNode = new Node<ElementType>(element);

    if (head == nullptr && tail == nullptr)

    { // if the list is empty

        head = newNode;

        tail = newNode;

    }

    else

    { // if the list is not empty

        newNode->next = head;

        head->back = newNode;

        head = newNode;

    }

    count++;

}

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::insertAtTail(const ElementType &element)

{

    Node<ElementType> *newNode = new Node<ElementType>(element);

    if (head == nullptr && tail == nullptr)

    { // if the list is empty

        head = newNode;

        tail = newNode;

    }

    else

    { // if the list is not empty

        newNode->back = tail;

        tail->next = newNode;

        tail = newNode;

    }

    count++;

}

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::insertAt(const ElementType &element, int index)

{

    if (index < 0 || index > count)

    {

        std::cout << "Error: Index out of range\n";

        return;

    }

  

    Node<ElementType> *newNode = new Node<ElementType>(element);

  

    if (index == 0) // index at head

    {

        insertAtHead(element);

        return;

    }

  

    else if (index == count) // index at tail

    {

        insertAtTail(element);

        return;

    }

  

    else

    {

        Node<ElementType> *current = head; // Loop until you find the index

        for (int i = 0; i < index - 1; ++i)

        {

            current = current->next;

        }

        newNode->next = current->next;

        current->next->back = newNode;

        current->next = newNode;

        newNode->back = current;

    }

    count++;

}

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::removeAtHead()

{

    if (head == nullptr)

    {

        std::cout << "Error: can't remove item; list is empty.\n";

        return;

    }

  

    Node<ElementType> *temp = head;

    head = head->next;

    if (head != nullptr)

    {

        head->back = nullptr;

    }

    else

    {

        tail = nullptr;

    }

    delete temp;

    count--;

}

template <typename ElementType>

void DoublyLinkedList<ElementType>::removeAtTail()

{

    if (tail == nullptr)

    {

        std::cout << "Error: can't remove item; list is empty.\n";

        return;

    }

  

    Node<ElementType> *temp = tail;

    tail = tail->back;

    if (tail != nullptr)

    {

        tail->next = nullptr;

    }

    else

    {

        head = nullptr;

    }

    delete temp;

    count--;

};

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::removeAt(int index)

{

    if (isEmpty())

    {

        std::cout << "Error: List is empty\n";

        return;

    }

  

    if (index < 0 || index > count)

    {

        std::cout << "Error: Index out of range\n";

        return;

    }

  

    if (index == 0)

    {

        removeAtHead();

        return;

    }

  

    else if (index == count - 1) // index at tail

    {

        removeAtTail();

        return;

    }

  

    else

    {

        Node<ElementType> *temp = head;

        for (int i = 0; i < index; ++i)

        {

            temp = temp->next;

        }

  

        temp->back->next = temp->next;

        temp->next->back = temp->back;

        delete temp;

    }

    count--;

};

  

template <typename ElementType>

ElementType DoublyLinkedList<ElementType>::retrieveAt(int index)

{

    if (isEmpty())

    {

        throw std::runtime_error("Error: List is empty");

    }

    if (index < 0 || index > count)

    {

        throw std::runtime_error("Error: Invalid index, out of range");

    }

    if (index == 0) // index at head

    {

        return head->info;

    }

  

    else if (index == count) // index at tail

    {

        return tail->info;

    }

  

    Node<ElementType> *temp = head;

    for (int i = 0; i < index; ++i)

    {

        temp = temp->next;

    }

    return temp->info;

};

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::replaceAt(const ElementType &newElement, int index)

{

    if (isEmpty())

    {

        std::cout << "Error: List is empty\n";

        return;

    }

    if (index < 0 || index > count)

    {

        std::cout << "Error: Index out of range\n";

        return;

    }

  

    if (index == 0)

    {

        head->info = newElement;

        return;

    }

  

    else if (index == count)

    {

        tail->info = newElement;

        return;

    }

  

    Node<ElementType> *temp = head;

    for (int i = 0; i < index; ++i)

    {

        temp = temp->next;

    }

    temp->info = newElement;

}

  

template <typename ElementType>

bool DoublyLinkedList<ElementType>::isItemAtEqual(const ElementType &element, int index)

{

    return (retrieveAt(index) == element);

};

  

template <typename ElementType>

void DoublyLinkedList<ElementType>::swap(int firstItemIdx, int secondItemIdx)

{

  

    if (head == nullptr || head->next == nullptr || firstItemIdx == secondItemIdx)

        return;

  

    Node<ElementType> *fisrtNode = head;

    Node<ElementType> *secondNode = head;

  

    // Finding the correct Nodes

    for (int i = 0; i < firstItemIdx; ++i)

    {

        fisrtNode = fisrtNode->next;

    }

  

    for (int i = 0; i < secondItemIdx; ++i)

    {

        secondNode = secondNode->next;

    }

  

    // reverse head and tail

    if (fisrtNode == head)

        head = secondNode;

    else if (secondNode == head)

        head = fisrtNode;

    if (fisrtNode == tail)

        tail = secondNode;

    else if (secondNode == tail)

        tail = fisrtNode;

  

    // First make each node points at the next adjacent node of the other

    Node<ElementType> *temp;

    temp = fisrtNode->next;

    fisrtNode->next = secondNode->next;

    secondNode->next = temp;

  

    // check if the nodes we pointed at is not the last or first, if so, make them point back at the nodes that we want to swap

    if (fisrtNode->next != nullptr)

        fisrtNode->next->back = fisrtNode;

    if (secondNode->next != nullptr)

        secondNode->next->back = secondNode;

  

    // vice versa

    temp = fisrtNode->back;

    fisrtNode->back = secondNode->back;

    secondNode->back = temp;

  

    if (fisrtNode->back != nullptr)

        fisrtNode->back->next = fisrtNode;

    if (secondNode->back != nullptr)

        secondNode->back->next = secondNode;

};
```